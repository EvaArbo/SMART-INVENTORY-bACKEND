const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../Middleware/Auth/authenticate');
const prisma = new PrismaClient();

// GET /profile - Retrieve user profile information
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const profile = await prisma.profile_info.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            user_pic: true,
            department: true,
            branch: true,
            status: true,
            created_at: true
          }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        userName: profile.user_name,
        profilePicture: profile.profile_picture,
        email: profile.email,
        phoneNumber: profile.phone_number,
        fullName: profile.user.full_name,
        userPic: profile.user.user_pic,
        department: profile.user.department,
        branch: profile.user.branch,
        status: profile.user.status,
        createdAt: profile.user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving profile',
      error: error.message
    });
  }
});

// PUT /profile - Update user profile information
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { userName, profilePicture, phoneNumber, fullName, department, branch } = req.body;

    // Update user table if fullName, department, or branch provided
    if (fullName !== undefined || department !== undefined || branch !== undefined) {
      await prisma.user.update({
        where: { user_id: userId },
        data: {
          ...(fullName !== undefined && { full_name: fullName }),
          ...(department !== undefined && { department }),
          ...(branch !== undefined && { branch })
        }
      });
    }

    // Update profile_info table
    const updatedProfile = await prisma.profile_info.update({
      where: { user_id: userId },
      data: {
        ...(userName !== undefined && { user_name: userName }),
        ...(profilePicture !== undefined && { profile_picture: profilePicture }),
        ...(phoneNumber !== undefined && { phone_number: phoneNumber })
      },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            user_pic: true,
            department: true,
            branch: true,
            status: true,
            created_at: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        userName: updatedProfile.user_name,
        profilePicture: updatedProfile.profile_picture,
        email: updatedProfile.email,
        phoneNumber: updatedProfile.phone_number,
        fullName: updatedProfile.user.full_name,
        userPic: updatedProfile.user.user_pic,
        department: updatedProfile.user.department,
        branch: updatedProfile.user.branch,
        status: updatedProfile.user.status,
        createdAt: updatedProfile.user.created_at
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: error.message
    });
  }
});

module.exports = router;
