const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'photos',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [
      { width: 1024, crop: "limit" },
      { quality: "auto" },
      { fetch_format: "auto" }
    ],
  },
});

const upload = multer({ storage });

module.exports = upload;
