const Photo = require('../models/Photo');
const { categories } = require('../models/Photo');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../config/cloudinary');

// Upload photo — Only Admins
const uploadPhoto = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    if (!categories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category provided' });
    }

    console.log('Uploaded file:', req.file);

    const photo = await Photo.create({
      name,
      category,
      description,
      imageUrl: req.file.path,
      public_id: req.file.filename,
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error('Upload Error:', error.message);
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get paginated photos — Public (no auth needed)
const getAllPhotos = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;

    if (page < 1) page = 1;
    if (limit < 1) limit = 5;

    const skip = (page - 1) * limit;

    const photos = await Photo.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Photo.countDocuments();

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total,
      photos,
    });
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ message: 'Server error fetching photos' });
  }
};

// Update photo
const updatePhoto = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (category && !categories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category provided' });
    }

    // If image file is uploaded (optional)
    if (req.file && photo.imageUrl && fs.existsSync(photo.imageUrl)) {
      fs.unlinkSync(photo.imageUrl);
      photo.imageUrl = req.file.path;
    }

    if (name) photo.name = name;
    if (category) photo.category = category;
    if (description) photo.description = description;

    await photo.save();

    res.json(photo);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete photo — Only Admins
const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    if (photo.public_id) {
      await cloudinary.uploader.destroy(photo.public_id);
    }

    await photo.deleteOne();

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send allowed categories to frontend
const getAllowedCategories = (req, res) => {
  res.json({ categories });
};


// Get photos by category with pagination — Public
const getPhotosByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    if (!categories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 5;

    if (page < 1) page = 1;
    if (limit < 1) limit = 5;

    const skip = (page - 1) * limit;

    // Get paginated photos for the category
    const photos = await Photo.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total photos count in this category
    const total = await Photo.countDocuments({ category });

    res.json({
      category,
      page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total,
      photos,
    });
  } catch (error) {
    console.error('Error fetching photos by category:', error);
    res.status(500).json({ message: 'Server error fetching category photos' });
  }
};

module.exports = {
  uploadPhoto,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  getAllowedCategories,
  getPhotosByCategory
};
