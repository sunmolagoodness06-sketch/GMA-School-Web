import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { 
  generateToken, 
  authenticateToken, 
  authorizeRoles, 
  rateLimitLogin 
} from '../middleware/auth.js';

const router = express.Router();

// Login endpoint
router.post('/login', rateLimitLogin, [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account has been deactivated. Please contact administration.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Get additional user info based on role
    let userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      division: user.division,
      lastLogin: user.lastLogin
    };

    // If user is a student, get student info
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        userData.student = {
          id: student._id,
          fullName: student.fullName,
          regNumber: student.regNumber,
          class: student.class,
          division: student.division,
          session: student.session
        };
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

// Public registration endpoint for existing students/parents
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'parent']).withMessage('Role must be either student or parent'),
  body('regNumber').optional().isString().withMessage('Registration number must be a string'),
  body('studentName').optional().isString().withMessage('Student name must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, role, regNumber, studentName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    let student = null;
    let division = null;

    if (role === 'student') {
      // Verify student exists with provided reg number
      if (!regNumber) {
        return res.status(400).json({
          success: false,
          message: 'Registration number is required for student accounts'
        });
      }

      student = await Student.findOne({ regNumber: regNumber.trim() });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'No student found with this registration number'
        });
      }

      // Check if student already has a user account
      if (student.userId) {
        return res.status(409).json({
          success: false,
          message: 'A portal account already exists for this student'
        });
      }

      // Verify email matches student record (optional but recommended)
      if (student.parentInfo.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: 'Email must match the email on file for this student'
        });
      }

      division = student.division;

    } else if (role === 'parent') {
      // For parent role, verify they have a child in the school
      if (!studentName) {
        return res.status(400).json({
          success: false,
          message: 'Student name is required for parent accounts'
        });
      }

      student = await Student.findOne({ 
        'parentInfo.email': email.toLowerCase(),
        fullName: { $regex: new RegExp(studentName.trim(), 'i') }
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'No student found with this parent email and student name combination'
        });
      }

      division = student.division;
    }

    // Create user account
    const userData = {
      email,
      passwordHash: password, // Will be hashed by the model
      role,
      division
    };

    const user = await User.createUser(userData);

    // Link student to user if it's a student account
    if (role === 'student' && student) {
      student.userId = user._id;
      await student.save();
    }

    res.status(201).json({
      success: true,
      message: `${role === 'student' ? 'Student' : 'Parent'} account created successfully! You can now log in to the portal.`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        division: user.division
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Admin register endpoint (for admin to create users)
router.post('/admin/register', authenticateToken, authorizeRoles('admin'), [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'parent', 'staff', 'admin']).withMessage('Invalid role'),
  body('division').optional().isIn(['nursery', 'primary', 'secondary', 'college']).withMessage('Invalid division')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, role, division } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const userData = {
      email,
      passwordHash: password, // Will be hashed by the model
      role,
      division: (role === 'student' || role === 'parent') ? division : undefined
    };

    const user = await User.createUser(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        division: user.division
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration'
    });
  }
});

// Change password endpoint
router.post('/change-password', authenticateToken, [
  body('currentPassword').isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      division: user.division,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    };

    // If user is a student, get student info
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        userData.student = {
          id: student._id,
          fullName: student.fullName,
          regNumber: student.regNumber,
          class: student.class,
          division: student.division,
          session: student.session,
          photoUrl: student.photoUrl,
          parentInfo: student.parentInfo
        };
      }
    }

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile'
    });
  }
});

// Logout endpoint (client-side token removal, but we can track it)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more sophisticated setup, you might want to blacklist the token
    // For now, we'll just return success and let client remove the token
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      division: req.user.division
    }
  });
});

// Password reset request (simplified version)
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with this email exists, you will receive password reset instructions.'
      });
    }

    // TODO: Generate reset token and send email
    // For now, just log it
    console.log('Password reset requested for:', email);

    res.json({
      success: true,
      message: 'If an account with this email exists, you will receive password reset instructions.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
});

// Get authentication status
router.get('/status', (req, res) => {
  res.json({ 
    message: 'Authentication system is ready',
    phase: 'Phase 2 - Authentication & Student Portal',
    features: [
      'User Login/Logout',
      'JWT Token Authentication',
      'Role-based Authorization',
      'Password Management',
      'Account Security'
    ]
  });
});

export default router;