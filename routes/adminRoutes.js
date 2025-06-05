const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin , changeAdminPassword,getDashboardInfo,forgotPassword,resetPassword  } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/change-password', protect, changeAdminPassword);
router.get('/dashboard', protect, getDashboardInfo);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);




module.exports = router;
