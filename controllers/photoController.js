const Photo = require('../models/Photo');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Upload photo — Only Admins
const uploadPhoto = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    console.log('Uploaded file:', req.file);

    const photo = await Photo.create({
      name,
      category,
      description,
      imageUrl: req.file.path,  // <-- use .path here
      public_id: req.file.filename, // save public_id for later deletion if you want
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

    // If image file is uploaded (optional)
    if (req.file && photo.imageUrl && fs.existsSync(photo.imageUrl)) {
      fs.unlinkSync(photo.imageUrl); // delete old file
      photo.imageUrl = req.file.path;
    }

    // Update other fields if provided
    if (name) photo.name = name;
    if (category) photo.category = category;
    if (description) photo.description = description;

    await photo.save();

    res.json(photo); // Return updated photo directly, not wrapped in message
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};



// Delete photo — Only Admins
const cloudinary = require('../config/cloudinary');

const deletePhoto = async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Extract public ID from photo.imageUrl or store public_id in DB on upload
    // Assuming you store public_id in DB on upload:
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


module.exports = {
  uploadPhoto,
  getAllPhotos,
  updatePhoto,
  deletePhoto
};
