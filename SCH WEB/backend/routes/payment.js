import express from 'express';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import Invoice from '../models/Invoice.js';
import Student from '../models/Student.js';
import { authenticateToken, authorizeStudentAccess } from '../middleware/auth.js';

const router = express.Router();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_your_secret_key';
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || 'pk_test_your_public_key';

// Initialize payment for school fees
router.post('/initialize', authenticateToken, [
  body('invoiceId').isMongoId().withMessage('Valid invoice ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
  body('callback_url').optional().isURL().withMessage('Valid callback URL required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { invoiceId, amount, callback_url } = req.body;

    // Verify invoice exists and user has access
    const invoice = await Invoice.findById(invoiceId)
      .populate('studentId', 'fullName regNumber parentInfo.email');
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if user has access to this invoice
    const { role } = req.user;
    if (role === 'student') {
      const student = await Student.findOne({ userId: req.userId });
      if (!student || student._id.toString() !== invoice.studentId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (role === 'parent') {
      if (invoice.studentId.parentInfo.email !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Validate payment amount
    const requestedAmount = parseFloat(amount);
    const maxAllowedAmount = invoice.balance;
    
    if (requestedAmount <= 0 || requestedAmount > maxAllowedAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be between ₦1 and ₦${maxAllowedAmount}`
      });
    }

    // Prepare Paystack initialization data
    const paystackData = {
      email: invoice.studentId.parentInfo.email,
      amount: Math.round(requestedAmount * 100), // Convert to kobo
      currency: 'NGN',
      reference: `GMA_${invoice.invoiceNumber}_${Date.now()}`,
      callback_url: callback_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/portal/payment/callback`,
      metadata: {
        invoiceId: invoice._id.toString(),
        studentId: invoice.studentId._id.toString(),
        studentName: invoice.studentId.fullName,
        invoiceNumber: invoice.invoiceNumber,
        paymentFor: `School fees - ${invoice.term} term ${invoice.session}`,
        custom_fields: [
          {
            display_name: "Student Name",
            variable_name: "student_name",
            value: invoice.studentId.fullName
          },
          {
            display_name: "Registration Number",
            variable_name: "reg_number",
            value: invoice.studentId.regNumber
          },
          {
            display_name: "Invoice Number",
            variable_name: "invoice_number",
            value: invoice.invoiceNumber
          }
        ]
      }
    };

    // Initialize payment with Paystack
    try {
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paystackData)
      });

      const paystackResult = await paystackResponse.json();

      if (!paystackResult.status) {
        return res.status(400).json({
          success: false,
          message: 'Payment initialization failed',
          error: paystackResult.message
        });
      }

      // Return payment details to frontend
      res.json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorization_url: paystackResult.data.authorization_url,
          access_code: paystackResult.data.access_code,
          reference: paystackResult.data.reference,
          amount: requestedAmount,
          invoice: {
            id: invoice._id,
            number: invoice.invoiceNumber,
            student: invoice.studentId.fullName,
            balance: invoice.balance
          }
        }
      });

    } catch (paystackError) {
      console.error('Paystack API error:', paystackError);
      return res.status(500).json({
        success: false,
        message: 'Payment service temporarily unavailable'
      });
    }

  } catch (error) {
    console.error('Payment initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while initializing payment'
    });
  }
});

// Verify payment status
router.get('/verify/:reference', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const paystackResult = await paystackResponse.json();

    if (!paystackResult.status) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        error: paystackResult.message
      });
    }

    const transaction = paystackResult.data;

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return res.json({
        success: false,
        message: 'Payment was not successful',
        data: {
          status: transaction.status,
          reference: transaction.reference
        }
      });
    }

    // Extract invoice ID from metadata
    const invoiceId = transaction.metadata.invoiceId;
    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Check if payment has already been recorded
    const existingPayment = invoice.paymentHistory.find(
      payment => payment.paystackReference === transaction.reference
    );

    if (existingPayment) {
      return res.json({
        success: true,
        message: 'Payment already recorded',
        data: {
          status: 'already_recorded',
          amount: existingPayment.amount,
          paymentDate: existingPayment.paymentDate
        }
      });
    }

    // Record payment in invoice
    const paymentAmount = transaction.amount / 100; // Convert from kobo to naira
    
    await invoice.addPayment({
      amount: paymentAmount,
      paymentMethod: 'paystack',
      paystackReference: transaction.reference,
      transactionId: transaction.id,
      receivedBy: null, // Automatic payment
      notes: `Online payment via Paystack - ${transaction.channel}`
    });

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      data: {
        status: 'success',
        amount: paymentAmount,
        reference: transaction.reference,
        paymentDate: new Date(transaction.paid_at),
        invoice: {
          number: invoice.invoiceNumber,
          newBalance: invoice.balance,
          status: invoice.status
        }
      }
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying payment'
    });
  }
});

// Paystack webhook endpoint
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(req.body).digest('hex');
    
    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = JSON.parse(req.body);
    
    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleSuccessfulPayment(event.data);
        break;
        
      case 'charge.failed':
        console.log('Payment failed:', event.data);
        break;
        
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// Helper function to handle successful payments
async function handleSuccessfulPayment(transactionData) {
  try {
    const { reference, amount, metadata } = transactionData;
    const invoiceId = metadata.invoiceId;

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      console.error('Invoice not found for webhook:', invoiceId);
      return;
    }

    // Check if payment already recorded
    const existingPayment = invoice.paymentHistory.find(
      payment => payment.paystackReference === reference
    );

    if (!existingPayment) {
      await invoice.addPayment({
        amount: amount / 100, // Convert from kobo
        paymentMethod: 'paystack',
        paystackReference: reference,
        transactionId: transactionData.id,
        notes: `Webhook confirmation - ${transactionData.channel}`
      });

      console.log('Payment recorded from webhook:', {
        invoiceNumber: invoice.invoiceNumber,
        amount: amount / 100,
        reference
      });
    }
  } catch (error) {
    console.error('Handle successful payment error:', error);
  }
}

// Get payment history for a student
router.get('/history/:studentId', authenticateToken, authorizeStudentAccess, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const invoices = await Invoice.find({
      studentId,
      'paymentHistory.0': { $exists: true }, // Has at least one payment
      isActive: true
    })
    .select('invoiceNumber term session paymentHistory amountPaid')
    .sort({ 'paymentHistory.paymentDate': -1 })
    .skip(skip)
    .limit(parseInt(limit));

    // Flatten payment history
    const paymentHistory = [];
    invoices.forEach(invoice => {
      invoice.paymentHistory.forEach(payment => {
        paymentHistory.push({
          invoiceNumber: invoice.invoiceNumber,
          term: invoice.term,
          session: invoice.session,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          reference: payment.paystackReference || payment.transactionId
        });
      });
    });

    // Sort by payment date
    paymentHistory.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const total = paymentHistory.length;

    res.json({
      success: true,
      data: {
        payments: paymentHistory.slice(0, parseInt(limit)),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });

  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching payment history'
    });
  }
});

// Get Paystack public key for frontend
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      publicKey: PAYSTACK_PUBLIC_KEY
    }
  });
});

export default router;