import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../models/Application.js';
import CareerApplication from '../models/CareerApplication.js';
import { uploadAdmissionDocuments, uploadCoverLetter } from '../middleware/upload.js';

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

// Application form submission (multipart: text fields + document uploads)
router.post('/apply', uploadAdmissionDocuments, [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female']).withMessage('Gender is required'),
  body('divisionApplied').isIn(['nursery', 'primary', 'secondary', 'college']).withMessage('Please select a valid division'),
  body('classApplied').trim().notEmpty().withMessage('Class is required'),
  body('sessionApplied').trim().notEmpty().withMessage('Session is required'),
  body('fatherName').trim().isLength({ min: 2 }).withMessage('Father\'s name is required'),
  body('fatherEmail').isEmail().withMessage('Valid father\'s email is required'),
  body('fatherPhone').trim().isLength({ min: 10 }).withMessage('Father\'s phone number is required'),
  body('motherName').trim().isLength({ min: 2 }).withMessage('Mother\'s name is required'),
  body('motherPhone').trim().isLength({ min: 10 }).withMessage('Mother\'s phone number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const files = req.files || {};
    const requiredDocs = {
      passportPhoto: 'passport_photo',
      birthCertificate: 'birth_certificate',
      medicalCertificate: 'medical_report'
    };

    const missingDocs = Object.keys(requiredDocs).filter((field) => !files[field]?.[0]);
    if (missingDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingDocs.join(', ')}`
      });
    }

    const documents = [];
    const docFieldMap = {
      birthCertificate: 'birth_certificate',
      previousSchoolRecords: 'previous_result',
      passportPhoto: 'passport_photo',
      medicalCertificate: 'medical_report'
    };

    for (const [field, docType] of Object.entries(docFieldMap)) {
      const file = files[field]?.[0];
      if (file) {
        documents.push({
          type: docType,
          fileName: file.originalname,
          fileUrl: file.path
        });
      }
    }

    const {
      firstName, middleName, lastName, dateOfBirth, gender,
      divisionApplied, classApplied, sessionApplied,
      fatherName, fatherEmail, fatherPhone,
      motherName, motherEmail, motherPhone
    } = req.body;

    const applicationNumber = await Application.generateApplicationNumber(
      sessionApplied || '2024/2025'
    );

    const application = new Application({
      applicantName: {
        firstName,
        ...(middleName && { middleName }),
        lastName
      },
      dateOfBirth,
      gender,
      divisionApplied,
      classApplied,
      sessionApplied,
      parentInfo: {
        father: {
          name: fatherName,
          email: fatherEmail,
          phone: fatherPhone
        },
        mother: {
          name: motherName,
          phone: motherPhone,
          ...(motherEmail && { email: motherEmail })
        }
      },
      documents,
      applicationNumber,
      status: 'pending'
    });

    await application.save();

    // TODO: Send confirmation email to parent
    console.log('Application submitted:', {
      applicationNumber,
      studentName: `${firstName} ${lastName}`,
      parentEmail: fatherEmail
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

// Career application submission (multipart: text fields + cover letter upload)
router.post('/careers/apply', uploadCoverLetter, [
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'A cover letter file is required'
      });
    }

    const { fullName, email, phone, position, experience, education } = req.body;

    const careerApplication = new CareerApplication({
      fullName,
      email,
      phone,
      position,
      experience,
      education,
      coverLetter: {
        fileName: req.file.originalname,
        fileUrl: req.file.path
      }
    });

    await careerApplication.save();

    // TODO: Send confirmation email
    console.log('Career application submitted:', {
      id: careerApplication._id,
      fullName,
      position
    });

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