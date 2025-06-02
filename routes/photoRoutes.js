const express = require('express');
const router = express.Router();
const {
  uploadPhoto,
  getAllPhotos,
  updatePhoto,
  deletePhoto
} = require('../controllers/photoController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Public - anyone can view photos
router.get('/', getAllPhotos);

// Admin only - upload, update, delete
router.post('/upload',protect, upload.single('image'), uploadPhoto);
router.put('/:id',protect, updatePhoto);
router.delete('/:id',protect, deletePhoto);

module.exports = router;
