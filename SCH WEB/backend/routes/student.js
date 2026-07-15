import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import ReportCard from '../models/ReportCard.js';
import Invoice from '../models/Invoice.js';
import Notice from '../models/Notice.js';
import { 
  authenticateToken, 
  authorizeRoles, 
  authorizeStudentAccess 
} from '../middleware/auth.js';

const router = express.Router();

// Get student dashboard data
router.get('/dashboard', authenticateToken, authorizeRoles('student', 'parent', 'staff', 'admin'), async (req, res) => {
  try {
    let studentId;
    
    // Determine student ID based on user role
    if (req.userRole === 'student') {
      const student = await Student.findOne({ userId: req.userId });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found'
        });
      }
      studentId = student._id;
    } else if (req.userRole === 'parent') {
      // Parent can view any of their children's dashboards. Matches on the
      // linked parentUserId first (how accounts are provisioned now),
      // falling back to contact-info matching for older records. Passing
      // ?studentId= picks a specific child (still scoped to this parent's
      // own children); omitting it defaults to the first one found.
      const baseQuery = {
        isActive: true,
        $or: [
          { parentUserId: req.userId },
          ...(req.user.email ? [{ 'parentInfo.email': req.user.email }] : []),
          ...(req.user.phone ? [{ 'parentInfo.phone': req.user.phone }] : [])
        ]
      };
      const student = req.query.studentId
        ? await Student.findOne({ ...baseQuery, _id: req.query.studentId })
        : await Student.findOne(baseQuery);
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'No student record found for this parent'
        });
      }
      studentId = student._id;
    } else {
      // Staff/Admin need studentId parameter
      studentId = req.query.studentId;
      if (!studentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required'
        });
      }
    }

    // Get student info
    const student = await Student.findById(studentId).populate('userId', 'email lastLogin');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get recent report cards
    const recentReportCards = await ReportCard.findByStudent(studentId, student.session);

    // Get outstanding invoices
    const outstandingInvoices = await Invoice.find({
      studentId,
      status: { $in: ['pending', 'partial', 'overdue'] },
      isActive: true
    }).limit(5);

    // Get recent notices for student's division
    const recentNotices = await Notice.findForUser(req.userRole, student.division).limit(5);

    // Calculate dashboard stats
    const totalOwed = outstandingInvoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    const overdueCount = outstandingInvoices.filter(invoice => 
      invoice.status === 'overdue' || invoice.dueDate < new Date()
    ).length;

    const dashboardData = {
      student: {
        id: student._id,
        fullName: student.fullName,
        regNumber: student.regNumber,
        class: student.class,
        division: student.division,
        session: student.session,
        photoUrl: student.photoUrl
      },
      stats: {
        totalOwed,
        overdueCount,
        recentReportCards: recentReportCards.length,
        unreadNotices: recentNotices.filter(notice => 
          !notice.hasUserRead(req.userId)
        ).length
      },
      recentActivity: {
        reportCards: recentReportCards.slice(0, 3),
        invoices: outstandingInvoices.slice(0, 3),
        notices: recentNotices.slice(0, 3)
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching dashboard data'
    });
  }
});

// Get student report cards
router.get('/:studentId/report-cards', authenticateToken, authorizeStudentAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { session, term } = req.query;

    let query = { studentId, isActive: true };
    if (session) query.session = session;
    if (term) query.term = term;

    const reportCards = await ReportCard.find(query)
      .sort({ session: -1, term: 1 })
      .populate('uploadedBy', 'email');

    res.json({
      success: true,
      data: reportCards
    });

  } catch (error) {
    console.error('Report cards fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching report cards'
    });
  }
});

// Get student invoices and bills
router.get('/:studentId/invoices', authenticateToken, authorizeStudentAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status, session } = req.query;

    let query = { studentId, isActive: true };
    if (status) query.status = status;
    if (session) query.session = session;

    const invoices = await Invoice.find(query)
      .populate('feeScheduleId', 'division class term session')
      .sort({ dueDate: -1 });

    // Calculate totals
    const summary = {
      totalOwed: invoices.filter(inv => ['pending', 'partial', 'overdue'].includes(inv.status))
        .reduce((sum, inv) => sum + inv.balance, 0),
      totalPaid: invoices.reduce((sum, inv) => sum + inv.amountPaid, 0),
      overdueCount: invoices.filter(inv => inv.status === 'overdue').length
    };

    res.json({
      success: true,
      data: {
        invoices,
        summary
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

// Get student notices
router.get('/:studentId/notices', authenticateToken, authorizeStudentAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { category, unreadOnly } = req.query;

    // Get student info to determine division
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    let notices = await Notice.findForUser(req.userRole, student.division);

    // Filter by category if specified
    if (category && category !== 'all') {
      notices = notices.filter(notice => notice.category === category);
    }

    // Filter unread only if specified
    if (unreadOnly === 'true') {
      notices = notices.filter(notice => !notice.hasUserRead(req.userId));
    }

    res.json({
      success: true,
      data: notices
    });

  } catch (error) {
    console.error('Notices fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching notices'
    });
  }
});

// Mark notice as read
router.post('/notices/:noticeId/read', authenticateToken, async (req, res) => {
  try {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    await notice.markAsRead(req.userId);

    res.json({
      success: true,
      message: 'Notice marked as read'
    });

  } catch (error) {
    console.error('Mark notice read error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while marking notice as read'
    });
  }
});

// Acknowledge notice
router.post('/notices/:noticeId/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { noticeId } = req.params;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({
        success: false,
        message: 'Notice not found'
      });
    }

    if (!notice.acknowledgmentRequired) {
      return res.status(400).json({
        success: false,
        message: 'This notice does not require acknowledgment'
      });
    }

    await notice.acknowledge(req.userId);

    res.json({
      success: true,
      message: 'Notice acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge notice error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while acknowledging notice'
    });
  }
});

// Update student profile (limited fields)
router.patch('/:studentId/profile', authenticateToken, authorizeStudentAccess, [
  body('photoUrl').optional().isURL().withMessage('Photo URL must be valid'),
  body('parentInfo.phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('emergencyContact.phone').optional().isMobilePhone().withMessage('Invalid emergency contact phone')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { studentId } = req.params;
    const allowedUpdates = ['photoUrl', 'parentInfo.phone', 'emergencyContact'];

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Update allowed fields only
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.some(field => key.startsWith(field))) {
        updates[key] = req.body[key];
      }
    });

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating profile'
    });
  }
});

// Get learning resources (placeholder for Phase 3)
router.get('/:studentId/resources', authenticateToken, authorizeStudentAccess, (req, res) => {
  res.json({
    success: true,
    message: 'Learning resources will be available in Phase 3',
    data: []
  });
});

export default router;