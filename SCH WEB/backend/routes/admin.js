import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Student from '../models/Student.js';
import ReportCard from '../models/ReportCard.js';
import FeeSchedule from '../models/FeeSchedule.js';
import Invoice from '../models/Invoice.js';
import Application from '../models/Application.js';
import Notice from '../models/Notice.js';
import { 
  authenticateToken, 
  authorizeRoles, 
  authorizeDivisionAccess 
} from '../middleware/auth.js';

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
      .populate('userId', 'email isActive lastLogin')
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
  body('parentInfo.email').isEmail().withMessage('Valid parent email is required'),
  body('parentInfo.phone').trim().notEmpty().withMessage('Parent phone is required'),
  body('userEmail').isEmail().withMessage('Valid student email is required'),
  body('userPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { userEmail, userPassword, ...studentData } = req.body;

    // Check if user email already exists
    const existingUser = await User.findByEmail(userEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate registration number
    const regNumber = await Student.generateRegNumber(studentData.division, studentData.session || '2024/2025');

    // Create user account
    const user = await User.createUser({
      email: userEmail,
      passwordHash: userPassword,
      role: 'student',
      division: studentData.division
    });

    // Create student record
    const student = new Student({
      ...studentData,
      userId: user._id,
      regNumber,
      session: studentData.session || '2024/2025'
    });

    await student.save();

    // Create parent user if needed
    if (studentData.createParentAccount) {
      const parentExists = await User.findByEmail(studentData.parentInfo.email);
      if (!parentExists) {
        await User.createUser({
          email: studentData.parentInfo.email,
          passwordHash: studentData.parentInfo.phone, // Temporary password
          role: 'parent',
          division: studentData.division
        });
      }
    }

    const populatedStudent = await Student.findById(student._id).populate('userId', 'email isActive');

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
    delete updates._id;

    const student = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('userId', 'email isActive');

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

// ===== NOTICE MANAGEMENT =====

// Create notice
router.post('/notices', authenticateToken, authorizeRoles('admin', 'staff'), [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('body').trim().isLength({ min: 10, max: 5000 }).withMessage('Body must be 10-5000 characters'),
  body('category').isIn(['general', 'academic', 'fees', 'events', 'holidays', 'emergency', 'maintenance', 'exam', 'admission']).withMessage('Invalid category'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('expiryDate').isISO8601().withMessage('Valid expiry date is required')
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
      newApplicationsThisWeek
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
      })
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