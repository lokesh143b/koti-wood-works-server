const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Photo = require("../models/Photo"); // assuming your photo model is here
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // You need to write this

// Generate JWT Token (no role)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register new admin
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const admin = await Admin.create({ name, email, password });

  res.status(201).json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    token: generateToken(admin._id),
  });
};

// Login admin
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(admin._id);

  res.json({
    id: admin._id,
    name: admin.name,
    email: admin.email,
    token,
  });
};

// Change admin password
const changeAdminPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required" });
  }

  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const isMatch = await admin.matchPassword(oldPassword);
  if (!isMatch) {
    return res.status(400).json({ message: "Incorrect old password" });
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ message: "Password changed successfully" });
};

// Dashboard info
const getDashboardInfo = async (req, res) => {
  try {
    const adminId = req.user.id;

    // Get admin info
    const admin = await Admin.findById(adminId).select("name email");

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Get total photos count
    const totalPhotos = await Photo.countDocuments();

    // Get photos uploaded in last 7 days (example)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentUploads = await Photo.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    res.json({
      adminName: admin.name,
      adminEmail: admin.email,
      totalPhotos,
      recentUploads,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// 1. Send reset password email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const message = `Reset your password by clicking the link: ${resetURL}`;

  try {
    await sendEmail({
      to: admin.email,
      subject: "Password Reset",
      text: message,
    });

    res.status(200).json({ message: "Reset link sent to email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not send email" });
  }
};

// 2. Reset password using token
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(404).json({ message: "Invalid token" });
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  changeAdminPassword,
  getDashboardInfo,
  forgotPassword,
  resetPassword,
};
