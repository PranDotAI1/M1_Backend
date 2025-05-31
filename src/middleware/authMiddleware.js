import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// JWT secret key - store this in your .env file
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Generate JWT token for a user
 * @param {Object} user - User data to encode in the token
 * @returns {String} JWT token
 */
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id },
    JWT_SECRET,
    { expiresIn: '20m' } // Token expires in 20 minutes
  );
};

/**
 * Middleware to protect routes with JWT authentication
 */
export const protect = (req, res, next) => {
  let token;

  // Get token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from token payload to request object
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please login again'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token'
    });
  }
};
