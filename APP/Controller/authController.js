const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Generate JWT Access Token (24 hours)
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Generate Refresh Token (7 days)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

// SIGNUP - Complete registration with organization
exports.signup = async (req, res) => {
  try {
    const {
      organizationName,
      organizationLocation,
      organizationPhoto,
      userName,
      organizationBio,
      email,
      password
    } = req.body;

    // Validation
    if (!organizationName || !organizationLocation || !userName || !organizationBio || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number, and 1 special character'
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        org_name: organizationName,
        org_location: organizationLocation,
        org_picture: organizationPhoto || null,
        bio: organizationBio,
        created_at: new Date()
      }
    });

    // Create Admin role for this organization
    const adminRole = await prisma.role.create({
      data: {
        org_id: organization.org_id,
        role_name: 'Admin',
        description: 'Full access to all features',
        permissions: JSON.stringify({
          canManageUsers: true,
          canManageRoles: true,
          canManageItems: true,
          canManageOrders: true,
          canManageVendors: true,
          canViewReports: true
        }),
        created_at: new Date()
      }
    });

    // Create user with Admin role
    const user = await prisma.user.create({
      data: {
        org_id: organization.org_id,
        role_id: adminRole.role_id,
        full_name: userName,
        email: email.toLowerCase(),
        password: hashedPassword,
        status: 'active',
        user_pic: null,
        department: null,
        branch: null,
        created_at: new Date()
      },
      include: {
        organization: true,
        role: true
      }
    });

    // Create user_password entry
    await prisma.user_password.create({
      data: {
        user_id: user.user_id,
        password: hashedPassword
      }
    });

    // Create profile_info entry
    await prisma.profile_info.create({
      data: {
        user_id: user.user_id,
        user_name: userName,
        profile_picture: null,
        email: email.toLowerCase(),
        phone_number: null,
        password: hashedPassword
      }
    });

    // Generate tokens
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userWithoutPassword.user_id,
          name: userWithoutPassword.full_name,
          email: userWithoutPassword.email,
          role: {
            id: userWithoutPassword.role.role_id,
            name: userWithoutPassword.role.role_name,
            permissions: JSON.parse(userWithoutPassword.role.permissions)
          },
          status: userWithoutPassword.status,
          department: userWithoutPassword.department,
          branch: userWithoutPassword.branch,
          createdAt: userWithoutPassword.created_at
        },
        organization: {
          id: organization.org_id,
          name: organization.org_name,
          location: organization.org_location,
          picture: organization.org_picture,
          bio: organization.bio,
          createdAt: organization.created_at
        }
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// SIGNIN - Login existing user
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        organization: true,
        role: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact administrator.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userWithoutPassword.user_id,
          name: userWithoutPassword.full_name,
          email: userWithoutPassword.email,
          role: {
            id: userWithoutPassword.role.role_id,
            name: userWithoutPassword.role.role_name,
            permissions: JSON.parse(userWithoutPassword.role.permissions)
          },
          status: userWithoutPassword.status,
          userPic: userWithoutPassword.user_pic,
          department: userWithoutPassword.department,
          branch: userWithoutPassword.branch,
          createdAt: userWithoutPassword.created_at
        },
        organization: {
          id: userWithoutPassword.organization.org_id,
          name: userWithoutPassword.organization.org_name,
          location: userWithoutPassword.organization.org_location,
          picture: userWithoutPassword.organization.org_picture,
          bio: userWithoutPassword.organization.bio,
          createdAt: userWithoutPassword.organization.created_at
        }
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// REFRESH TOKEN - Get new access token
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await prisma.user.findUnique({
      where: { user_id: decoded.userId },
      include: {
        organization: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active'
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.user_id);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newAccessToken
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh',
      error: error.message
    });
  }
};

// VERIFY TOKEN - Verify if access token is valid
exports.verifyToken = async (req, res) => {
  try {
    // Token is already verified by authenticate middleware
    // User data is available in req.user
    const user = await prisma.user.findUnique({
      where: { user_id: req.user.userId },
      include: {
        organization: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: {
          id: userWithoutPassword.user_id,
          name: userWithoutPassword.full_name,
          email: userWithoutPassword.email,
          role: {
            id: userWithoutPassword.role.role_id,
            name: userWithoutPassword.role.role_name,
            permissions: JSON.parse(userWithoutPassword.role.permissions)
          },
          status: userWithoutPassword.status,
          userPic: userWithoutPassword.user_pic,
          department: userWithoutPassword.department,
          branch: userWithoutPassword.branch,
          createdAt: userWithoutPassword.created_at
        },
        organization: {
          id: userWithoutPassword.organization.org_id,
          name: userWithoutPassword.organization.org_name,
          location: userWithoutPassword.organization.org_location,
          picture: userWithoutPassword.organization.org_picture,
          bio: userWithoutPassword.organization.bio,
          createdAt: userWithoutPassword.organization.created_at
        }
      }
    });

  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification',
      error: error.message
    });
  }
};

// LOGOUT - Invalidate tokens (optional - client handles by deleting tokens)
exports.logout = async (req, res) => {
  try {
    // In a more complex setup, you'd add the token to a blacklist
    // For now, client will delete tokens
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};