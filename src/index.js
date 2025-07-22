import express from 'express';
import mongoose from 'mongoose';
import { logError } from './utils/errorLogger.js';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import abhaRoutes from './routes/routers.js';


// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://admin:Pran.ai@22@13.201.185.3:27017/ABDM?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
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
