import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Student from '../models/Student.js';
import ReportCard from '../models/ReportCard.js';
import FeeSchedule from '../models/FeeSchedule.js';
import Invoice from '../models/Invoice.js';
import Application from '../models/Application.js';
import CareerApplication from '../models/CareerApplication.js';
import ContactMessage from '../models/ContactMessage.js';
import Notice from '../models/Notice.js';
import {
  authenticateToken,
  authorizeRoles,
  authorizeDivisionAccess
} from '../middleware/auth.js';
import { sendCredentialsEmail } from '../utils/email.js';
import { sendCredentialsSMS } from '../utils/sms.js';
import { uploadReportCard } from '../middleware/upload.js';

const router = express.Router();

// ===== STUDENT MANAGEMENT =====

// Get all students with filtering
router.get('/students', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { division, class: className, session, search, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    if (division) query.division = division;
    if (className) query.class = className;
    if (session) query.session = session;
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * limit;
    const students = await Student.find(query)
      .populate('userId', 'isActive lastLogin')
      .sort({ fullName: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Students fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching students'
    });
  }
});

// Create new student
router.post('/students', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('division').isIn(['nursery', 'primary', 'secondary', 'college']).withMessage('Invalid division'),
  body('class').trim().notEmpty().withMessage('Class is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female']).withMessage('Gender is required'),
  body('parentInfo.name').trim().notEmpty().withMessage('Parent name is required'),
  body('parentInfo.email').optional({ checkFalsy: true }).isEmail().withMessage('Please provide a valid parent email'),
  body('parentInfo.phone').trim().notEmpty().withMessage('Parent phone is required'),
  body('parentInfo.address').trim().notEmpty().withMessage('Parent address is required'),
  body('emergencyContact.name').trim().notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.phone').trim().notEmpty().withMessage('Emergency contact phone is required'),
  body('emergencyContact.relationship').trim().notEmpty().withMessage('Emergency contact relationship is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const studentData = req.body;

    // Generate registration number
    const regNumber = await Student.generateRegNumber(studentData.division, studentData.session || '2024/2025');

    // Validate the student record BEFORE creating any login account, so a
    // bad field (e.g. a missing address) can't leave an orphaned user with
    // no matching student record behind.
    const student = new Student({
      ...studentData,
      userId: new mongoose.Types.ObjectId(),
      regNumber,
      session: studentData.session || '2024/2025'
    });
    await student.validate();

    // The student logs in with their registration number, not an email or
    // phone — sidesteps ever colliding with the parent's own contact info.
    const studentPassword = crypto.randomBytes(4).toString('hex');
    const studentUser = await User.createUser({
      passwordHash: studentPassword,
      role: 'student',
      division: studentData.division
    });

    student.userId = studentUser._id;

    // Create parent user if requested, reusing an existing account for siblings
    if (studentData.createParentAccount) {
      const parentIdentifier = studentData.parentInfo.email || studentData.parentInfo.phone;
      let parentUser = await User.findByIdentifier(parentIdentifier);
      let generatedParentPassword = null;
      if (!parentUser) {
        generatedParentPassword = crypto.randomBytes(4).toString('hex');
        parentUser = await User.createUser({
          email: studentData.parentInfo.email || undefined,
          phone: studentData.parentInfo.phone || undefined,
          passwordHash: generatedParentPassword,
          role: 'parent',
          division: studentData.division
        });
      }
      student.parentUserId = parentUser._id;

      if (generatedParentPassword) {
        if (parentUser.phone) {
          await sendCredentialsSMS({ phone: parentUser.phone, identifier: parentUser.email || parentUser.phone, password: generatedParentPassword, role: 'parent' });
        }
        if (parentUser.email) {
          await sendCredentialsEmail({ email: parentUser.email, identifier: parentUser.email, password: generatedParentPassword, studentName: student.fullName });
        }
      }
    }

    await student.save();

    // The student's own login always goes to the parent's contact info —
    // the student account has no email/phone of its own.
    if (studentData.parentInfo.phone) {
      await sendCredentialsSMS({ phone: studentData.parentInfo.phone, identifier: regNumber, password: studentPassword, role: 'student' });
    }
    if (studentData.parentInfo.email) {
      await sendCredentialsEmail({ email: studentData.parentInfo.email, identifier: regNumber, password: studentPassword, studentName: student.fullName });
    }

    const populatedStudent = await Student.findById(student._id).populate('userId', 'isActive');

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: populatedStudent
    });

  } catch (error) {
    console.error('Student creation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating student'
    });
  }
});

// Update student
router.patch('/students/:studentId', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.regNumber;
    delete updates.userId;
    delete updates.parentUserId;
    delete updates._id;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'isActive');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });

  } catch (error) {
    console.error('Student update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating student'
    });
  }
});

// ===== REPORT CARD MANAGEMENT =====

// Get report cards (optionally filtered by student/division/class/session/term)
router.get('/report-cards', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { studentId, division, class: className, session, term, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (studentId) query.studentId = studentId;
    if (division) query.division = division;
    if (className) query.class = className;
    if (session) query.session = session;
    if (term) query.term = term;

    const skip = (page - 1) * limit;
    const reportCards = await ReportCard.find(query)
      .populate('studentId', 'fullName regNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ReportCard.countDocuments(query);

    res.json({
      success: true,
      data: {
        reportCards,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Report cards fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching report cards'
    });
  }
});

// Upload a report card for a student
router.post('/report-cards', authenticateToken, authorizeRoles('admin', 'staff'), uploadReportCard, [
  body('studentId').isMongoId().withMessage('Valid student is required'),
  body('term').isIn(['first', 'second', 'third']).withMessage('Invalid term'),
  body('session').trim().notEmpty().withMessage('Session is required')
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
        message: 'A report card PDF is required'
      });
    }

    const { studentId, term, session } = req.body;

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const reportCard = await ReportCard.create({
      studentId,
      term,
      session,
      fileUrl: req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      uploadedBy: req.userId,
      division: student.division,
      class: student.class
    });

    res.status(201).json({
      success: true,
      message: 'Report card uploaded successfully',
      data: reportCard
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A report card for this student, term, and session already exists'
      });
    }
    console.error('Report card upload error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while uploading the report card'
    });
  }
});

// Remove a report card
router.delete('/report-cards/:reportCardId', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const reportCard = await ReportCard.findByIdAndUpdate(
      req.params.reportCardId,
      { isActive: false },
      { new: true }
    );

    if (!reportCard) {
      return res.status(404).json({ success: false, message: 'Report card not found' });
    }

    res.json({ success: true, message: 'Report card deleted successfully' });

  } catch (error) {
    console.error('Report card deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting the report card'
    });
  }
});

// ===== FEE SCHEDULE MANAGEMENT =====

// Create fee schedule
router.post('/fee-schedules', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('division').isIn(['nursery', 'primary', 'secondary', 'college']).withMessage('Invalid division'),
  body('class').trim().notEmpty().withMessage('Class is required'),
  body('term').isIn(['first', 'second', 'third']).withMessage('Invalid term'),
  body('session').trim().notEmpty().withMessage('Session is required'),
  body('feeItems').isArray({ min: 1 }).withMessage('At least one fee item is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const feeScheduleData = {
      ...req.body,
      createdBy: req.userId
    };

    const feeSchedule = new FeeSchedule(feeScheduleData);
    await feeSchedule.save();

    res.status(201).json({
      success: true,
      message: 'Fee schedule created successfully',
      data: feeSchedule
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Fee schedule already exists for this class, term, and session'
      });
    }
    
    console.error('Fee schedule creation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating fee schedule'
    });
  }
});

// Generate invoices from fee schedule
router.post('/fee-schedules/:feeScheduleId/generate-invoices', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { feeScheduleId } = req.params;

    const feeSchedule = await FeeSchedule.findById(feeScheduleId);
    if (!feeSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Fee schedule not found'
      });
    }

    // Get all students in the class
    const students = await Student.findByDivisionAndClass(
      feeSchedule.division,
      feeSchedule.class,
      feeSchedule.session
    );

    const invoices = [];
    
    for (const student of students) {
      // Check if invoice already exists
      const existingInvoice = await Invoice.findOne({
        studentId: student._id,
        feeScheduleId,
        term: feeSchedule.term,
        session: feeSchedule.session
      });

      if (!existingInvoice) {
        const invoiceNumber = await Invoice.generateInvoiceNumber(feeSchedule.session);
        
        const invoice = new Invoice({
          invoiceNumber,
          studentId: student._id,
          feeScheduleId,
          term: feeSchedule.term,
          session: feeSchedule.session,
          feeItems: feeSchedule.feeItems.map(item => ({
            name: item.name,
            description: item.description,
            amount: item.amount,
            category: item.category
          })),
          amountDue: feeSchedule.totalAmount,
          dueDate: feeSchedule.dueDate,
          createdBy: req.userId
        });

        await invoice.save();
        invoices.push(invoice);
      }
    }

    res.json({
      success: true,
      message: `Generated ${invoices.length} invoices`,
      data: {
        generated: invoices.length,
        skipped: students.length - invoices.length
      }
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while generating invoices'
    });
  }
});

// Get all fee schedules
router.get('/fee-schedules', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { division, session, term, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (division) query.division = division;
    if (session) query.session = session;
    if (term) query.term = term;

    const skip = (page - 1) * limit;
    const feeSchedules = await FeeSchedule.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await FeeSchedule.countDocuments(query);

    res.json({
      success: true,
      data: {
        feeSchedules,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Fee schedules fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching fee schedules'
    });
  }
});

// Get all invoices
router.get('/invoices', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { status, division, session, studentId, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (status) query.status = status;
    if (session) query.session = session;
    if (studentId) query.studentId = studentId;

    const skip = (page - 1) * limit;
    let invoicesQuery = Invoice.find(query)
      .populate('studentId', 'fullName regNumber division class')
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    let invoices = await invoicesQuery;

    // Division isn't stored directly on Invoice, so filter after populating
    if (division) {
      invoices = invoices.filter((inv) => inv.studentId?.division === division);
    }

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data: {
        invoices,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Invoices fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching invoices'
    });
  }
});

// Manually record a payment against an invoice (cash, bank transfer, etc. — Paystack payments are recorded automatically via the payment routes)
router.post('/invoices/:invoiceId/payments', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('amount').isFloat({ min: 0.01 }).withMessage('A valid payment amount is required'),
  body('paymentMethod').isIn(['cash', 'bank_transfer', 'card', 'other']).withMessage('Invalid payment method'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const invoice = await Invoice.findById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    await invoice.addPayment({
      amount: req.body.amount,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes,
      receivedBy: req.userId
    });

    res.json({ success: true, message: 'Payment recorded successfully', data: invoice });

  } catch (error) {
    console.error('Payment recording error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while recording the payment'
    });
  }
});

// ===== APPLICATION MANAGEMENT =====

// Get all applications
router.get('/applications', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { status, division, session, page = 1, limit = 20 } = req.query;
    
    let query = { isActive: true };
    if (status) query.status = status;
    if (division) query.divisionApplied = division;
    if (session) query.sessionApplied = session;

    const skip = (page - 1) * limit;
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching applications'
    });
  }
});

// Creates (or reuses, for a sibling's application) a parent portal account,
// a separate student portal account (login is the registration number, not
// email/phone — sidesteps students and parents ever colliding on the same
// contact info), and the Student record linking them. Sends both sets of
// credentials to the parent's contact info, since the student has none of
// their own. Skips work if this application was already provisioned, so
// re-approving is safe to repeat.
const provisionAccountFromApplication = async (application) => {
  if (application.linkedStudentId) return;

  const father = application.parentInfo.father;
  const parentIdentifier = father.email || father.phone;

  let parentUser = await User.findByIdentifier(parentIdentifier);
  let generatedParentPassword = null;

  if (!parentUser) {
    generatedParentPassword = crypto.randomBytes(4).toString('hex');
    parentUser = await User.createUser({
      email: father.email || undefined,
      phone: father.phone || undefined,
      passwordHash: generatedParentPassword,
      role: 'parent',
      division: application.divisionApplied
    });
  }

  const regNumber = await Student.generateRegNumber(application.divisionApplied, application.sessionApplied);
  const passportPhoto = application.documents.find((doc) => doc.type === 'passport_photo');

  const studentPassword = crypto.randomBytes(4).toString('hex');
  const studentUser = await User.createUser({
    passwordHash: studentPassword,
    role: 'student',
    division: application.divisionApplied
  });

  const student = new Student({
    userId: studentUser._id,
    parentUserId: parentUser._id,
    regNumber,
    fullName: application.fullName,
    class: application.classApplied,
    division: application.divisionApplied,
    session: application.sessionApplied,
    photoUrl: passportPhoto?.fileUrl || null,
    dateOfBirth: application.dateOfBirth,
    gender: application.gender,
    parentInfo: {
      name: father.name,
      ...(father.email && { email: father.email }),
      phone: father.phone,
      relationship: 'father',
      address: father.address || 'Not provided'
    },
    emergencyContact: {
      name: father.name,
      phone: father.phone,
      relationship: 'father'
    },
    medicalInfo: {
      bloodGroup: application.medicalInfo?.bloodGroup,
      allergies: application.medicalInfo?.allergies,
      medications: application.medicalInfo?.medications
    }
  });

  await student.save();

  application.linkedStudentId = student._id;
  await application.save();

  if (generatedParentPassword) {
    if (parentUser.phone) {
      await sendCredentialsSMS({
        phone: parentUser.phone,
        identifier: parentUser.email || parentUser.phone,
        password: generatedParentPassword,
        role: 'parent'
      });
    }
    if (parentUser.email) {
      await sendCredentialsEmail({
        email: parentUser.email,
        identifier: parentUser.email,
        password: generatedParentPassword,
        studentName: student.fullName
      });
    }
  }

  // The student's own login always goes to the parent's contact — the
  // student account has no email/phone of its own to send to directly.
  if (father.phone) {
    await sendCredentialsSMS({
      phone: father.phone,
      identifier: regNumber,
      password: studentPassword,
      role: 'student'
    });
  }
  if (father.email) {
    await sendCredentialsEmail({
      email: father.email,
      identifier: regNumber,
      password: studentPassword,
      studentName: student.fullName
    });
  }
};

// Update application status
router.patch('/applications/:applicationId/status', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('status').isIn(['pending', 'under_review', 'approved', 'rejected', 'waitlisted']).withMessage('Invalid status'),
  body('remarks').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { applicationId } = req.params;
    const { status, remarks } = req.body;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    await application.updateStatus(status, req.userId, remarks);

    if (status === 'approved') {
      await provisionAccountFromApplication(application);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });

  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating application status'
    });
  }
});

// ===== CAREER APPLICATION MANAGEMENT =====

// Get all career applications
router.get('/career-applications', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { status, position, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (status) query.status = status;
    if (position) query.position = position;

    const skip = (page - 1) * limit;
    const careerApplications = await CareerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CareerApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        careerApplications,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Career applications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching career applications'
    });
  }
});

// Update career application status
router.patch('/career-applications/:careerApplicationId/status', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('status').isIn(['pending', 'reviewing', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { careerApplicationId } = req.params;
    const { status } = req.body;

    const careerApplication = await CareerApplication.findByIdAndUpdate(
      careerApplicationId,
      { status },
      { new: true, runValidators: true }
    );

    if (!careerApplication) {
      return res.status(404).json({
        success: false,
        message: 'Career application not found'
      });
    }

    res.json({
      success: true,
      message: 'Career application status updated successfully',
      data: careerApplication
    });

  } catch (error) {
    console.error('Career application status update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating career application status'
    });
  }
});

// ===== CONTACT MESSAGE MANAGEMENT =====

// Get all contact messages
router.get('/messages', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Contact messages fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching contact messages'
    });
  }
});

// Update contact message status
router.patch('/messages/:messageId/status', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('status').isIn(['new', 'read', 'replied']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { messageId } = req.params;
    const { status } = req.body;

    const message = await ContactMessage.findByIdAndUpdate(
      messageId,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message status updated successfully',
      data: message
    });

  } catch (error) {
    console.error('Contact message status update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating message status'
    });
  }
});

// ===== STAFF MANAGEMENT =====

// Get all staff/admin accounts (admin only — staff shouldn't see other staff's contact info)
router.get('/staff', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    let query = { role: { $in: ['staff', 'admin'] } };
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const staff = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        staff,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Staff fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching staff'
    });
  }
});

// Activate/deactivate a staff account
router.patch('/staff/:userId/status', authenticateToken, authorizeRoles('admin'), [
  body('isActive').isBoolean().withMessage('isActive must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.params.userId, role: { $in: ['staff', 'admin'] } },
      { isActive: req.body.isActive },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff account not found' });
    }

    res.json({ success: true, message: 'Staff account updated successfully', data: user });

  } catch (error) {
    console.error('Staff status update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating staff account'
    });
  }
});

// ===== NOTICE MANAGEMENT =====

// Get all notices
router.get('/notices', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { category, isPublished, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };
    if (category) query.category = category;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const skip = (page - 1) * limit;
    const notices = await Notice.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notice.countDocuments(query);

    res.json({
      success: true,
      data: {
        notices,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Notices fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching notices'
    });
  }
});

// Create notice
router.post('/notices', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('body').trim().isLength({ min: 10, max: 5000 }).withMessage('Body must be 10-5000 characters'),
  body('category').isIn(['general', 'academic', 'fees', 'events', 'holidays', 'emergency', 'maintenance', 'exam', 'admission']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
  body('targetAudience.roles').optional().isArray(),
  body('targetAudience.divisions').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const noticeData = {
      ...req.body,
      createdBy: req.userId
    };

    const notice = new Notice(noticeData);
    await notice.save();

    res.status(201).json({
      success: true,
      message: 'Notice created successfully',
      data: notice
    });

  } catch (error) {
    console.error('Notice creation error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while creating notice'
    });
  }
});

// Publish/unpublish a notice
router.patch('/notices/:noticeId/publish', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('isPublished').isBoolean().withMessage('isPublished must be true or false')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const notice = await Notice.findByIdAndUpdate(
      req.params.noticeId,
      { isPublished: req.body.isPublished, lastModifiedBy: req.userId },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, message: 'Notice updated successfully', data: notice });

  } catch (error) {
    console.error('Notice publish toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating notice'
    });
  }
});

// Deactivate (soft-delete) a notice
router.delete('/notices/:noticeId', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.noticeId,
      { isActive: false },
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    res.json({ success: true, message: 'Notice deleted successfully' });

  } catch (error) {
    console.error('Notice deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while deleting notice'
    });
  }
});

// Get admin dashboard stats
router.get('/dashboard/stats', authenticateToken, authorizeRoles('admin', 'staff'), async (req, res) => {
  try {
    const { division } = req.query;
    
    // Build queries based on user role and division access
    let studentQuery = { isActive: true };
    let applicationQuery = { isActive: true };
    let invoiceQuery = { isActive: true };
    
    if (division) {
      studentQuery.division = division;
      applicationQuery.divisionApplied = division;
    }

    // Get counts
    const [
      totalStudents,
      pendingApplications,
      overdueInvoices,
      activeNotices,
      newApplicationsThisWeek,
      newMessages,
      pendingCareerApplications
    ] = await Promise.all([
      Student.countDocuments(studentQuery),
      Application.countDocuments({ ...applicationQuery, status: 'pending' }),
      Invoice.countDocuments({
        ...invoiceQuery,
        status: 'overdue',
        dueDate: { $lt: new Date() }
      }),
      Notice.countDocuments({
        isPublished: true,
        isActive: true,
        expiryDate: { $gte: new Date() }
      }),
      Application.countDocuments({
        ...applicationQuery,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      ContactMessage.countDocuments({ isActive: true, status: 'new' }),
      CareerApplication.countDocuments({ isActive: true, status: 'pending' })
    ]);

    // Get revenue summary
    const revenueData = await Invoice.aggregate([
      { $match: { ...invoiceQuery, status: 'paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amountPaid' } } }
    ]);

    const stats = {
      students: {
        total: totalStudents,
        // Add more student stats as needed
      },
      applications: {
        pending: pendingApplications,
        thisWeek: newApplicationsThisWeek
      },
      financial: {
        overdueInvoices,
        totalRevenue: revenueData[0]?.totalRevenue || 0
      },
      notices: {
        active: activeNotices
      },
      messages: {
        new: newMessages
      },
      careerApplications: {
        pending: pendingCareerApplications
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching dashboard stats'
    });
  }
});

export default router;