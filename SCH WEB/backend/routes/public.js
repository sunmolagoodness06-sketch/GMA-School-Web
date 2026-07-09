import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';

const router = express.Router();

// Contact form submission
router.post('/contact', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number must be at least 10 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, phone, message, subject } = req.body;

    // TODO: Save to database and send email
    console.log('Contact form submission:', { name, email, phone, subject, message });

    res.json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon!'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Application form submission
router.post('/apply', [
  // Basic student info validation
  body('applicantName.firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('applicantName.lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female']).withMessage('Gender is required'),

  // School application details
  body('divisionApplied').isIn(['nursery', 'primary', 'secondary', 'college']).withMessage('Please select a valid division'),
  body('classApplied').trim().notEmpty().withMessage('Class is required'),
  body('sessionApplied').trim().notEmpty().withMessage('Session is required'),

  // Parent information validation
  body('parentInfo.father.name').trim().isLength({ min: 2 }).withMessage('Father\'s name is required'),
  body('parentInfo.father.email').isEmail().withMessage('Valid father\'s email is required'),
  body('parentInfo.father.phone').trim().isLength({ min: 10 }).withMessage('Father\'s phone number is required'),
  body('parentInfo.mother.name').trim().isLength({ min: 2 }).withMessage('Mother\'s name is required'),
  body('parentInfo.mother.phone').trim().isLength({ min: 10 }).withMessage('Mother\'s phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const applicationData = req.body;

    // Generate application number
    const applicationNumber = await Application.generateApplicationNumber(
      applicationData.sessionApplied || '2024/2025'
    );

    // Create application
    const application = new Application({
      ...applicationData,
      applicationNumber,
      status: 'pending'
    });

    await application.save();

    // TODO: Send confirmation email to parent
    console.log('Application submitted:', {
      applicationNumber,
      studentName: `${applicationData.applicantName.firstName} ${applicationData.applicantName.lastName}`,
      parentEmail: applicationData.parentInfo.father.email
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! We will review and contact you soon.',
      data: {
        applicationNumber,
        applicationId: application._id,
        studentName: application.fullName
      }
    });
  } catch (error) {
    console.error('Application form error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Check application status
router.get('/application-status/:applicationNumber', async (req, res) => {
  try {
    const { applicationNumber } = req.params;

    const application = await Application.findOne({
      applicationNumber,
      isActive: true
    }).select('applicationNumber status createdAt admissionDecision applicantName divisionApplied sessionApplied');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found. Please check your application number.'
      });
    }

    res.json({
      success: true,
      data: {
        applicationNumber: application.applicationNumber,
        studentName: application.fullName,
        status: application.status,
        divisionApplied: application.divisionApplied,
        sessionApplied: application.sessionApplied,
        submittedDate: application.createdAt,
        decision: application.admissionDecision
      }
    });

  } catch (error) {
    console.error('Application status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to check application status. Please try again.'
    });
  }
});

// Career application submission
router.post('/careers/apply', [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number is required'),
  body('position').trim().notEmpty().withMessage('Position is required'),
  body('experience').trim().notEmpty().withMessage('Experience is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const careerData = req.body;

    // TODO: Save to database and send confirmation email
    console.log('Career application:', careerData);

    res.json({
      success: true,
      message: 'Application submitted successfully! We will review and contact you soon.'
    });
  } catch (error) {
    console.error('Career application error:', error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
});

// Get public notices (for homepage display)
router.get('/notices', async (req, res) => {
  try {
    // This would typically get notices marked as public
    // For now, we'll return empty array as notices will be implemented in admin
    res.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Public notices error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch notices'
    });
  }
});

export default router;