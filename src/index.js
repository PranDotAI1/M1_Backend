import express from 'express';
import mongoose from 'mongoose';
import { logError } from './utils/errorLogger.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import abhaRoutes from './routes/routers.js';
import UserModel from './models/user.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://admin:Pran.ai%4022@13.201.185.3:27017/Patient_DB?authSource=admin')
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    
    // List all collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('📚 Available collections:', collections.map(c => c.name));
      
      // Check if Patients collection exists
      const hasPatientsCollection = collections.some(c => c.name === 'Patients');
      if (!hasPatientsCollection) {
        console.log('⚠️ Patients collection not found, will be created on first insert');
      } else {
        console.log('✅ Patients collection exists');
        
        // Count patients
        const patientCount = await UserModel.countDocuments();
        console.log(`📊 Total patients: ${patientCount}`);
      }
    } catch (error) {
      console.error('❌ Error checking collections:', error);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

const app = express();
const PORT = process.env.PORT || 4200;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

app.get('/hi', (req, res) => {
  res.json({ message: 'Hello world' });
});




app.use('/api/abha', abhaRoutes);


// Error handling middleware
app.use(async (err, req, res, next) => {
  console.error(err.stack);
  await logError(req.originalUrl, err.message, err.response || null);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
