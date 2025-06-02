const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin , changeAdminPassword,getDashboardInfo  } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/change-password', protect, changeAdminPassword);
router.get('/dashboard', protect, getDashboardInfo);



module.exports = router;
