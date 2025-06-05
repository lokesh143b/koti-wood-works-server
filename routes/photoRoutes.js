const express = require('express');
const router = express.Router();
const {
  uploadPhoto,
  getAllPhotos,
  updatePhoto,
  deletePhoto,
  getAllowedCategories,
  getPhotosByCategory
} = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public - anyone can view photos
router.get('/', getAllPhotos);
router.get('/categories', getAllowedCategories);
router.get('/category/:category', getPhotosByCategory);


// Admin only - upload, update, delete
router.post('/upload',protect, upload.single('image'), uploadPhoto);
router.put('/:id',protect, updatePhoto);
router.delete('/:id',protect, deletePhoto);



module.exports = router;
