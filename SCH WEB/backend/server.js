import './config/env.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import publicRoutes from './routes/public.js';
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payment.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'GMA School API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gma-school';
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    // 5s was cutting it too close on this network path — a direct connectivity
    // check showed the initial handshake alone can take ~4.6s (DNS + TLS +
    // replica set discovery across 3 shard hosts), so 5s produced an
    // intermittent pass/fail race rather than a real outage. socketTimeoutMS
    // and minPoolSize give the same margin to in-flight operations and keep
    // a couple of connections warm so requests don't have to renegotiate a
    // fresh connection from scratch as often.
    const connectPromise = mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 30000,
      minPoolSize: 2,
    });
    
    await connectPromise;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Make sure MongoDB is running or check your connection string');
    console.log('Server will continue without database connection for now...');
    // Don't exit in development - allow server to run without DB for frontend testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
  });
};

startServer();