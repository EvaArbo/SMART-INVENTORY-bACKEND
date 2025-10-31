const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../Middleware/Auth/authenticate');
const prisma = new PrismaClient();

// PUT /security - Change user password
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old password and new password are required'
      });
    }

    // Password validation for new password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character'
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Old password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password in user table
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword }
    });

    // Update password in user_password table
    await prisma.user_password.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword }
    });

    // Update password in profile_info table
    await prisma.profile_info.update({
      where: { user_id: userId },
      data: { password: hashedNewPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password',
      error: error.message
    });
  }
});

module.exports = router;
