import abhaService from '../services/abhaService.js';
import path from 'path';
import fs from 'fs';
import Aadhaarenroll from '../models/Enroll_via_aadhar.js';
import { getXToken, clearXTokenCookie, setXTokenCookie, extractToken } from '../utils/cookieHelper.js';

/**
 * Get access token for ABDM APIs
 */
export const getAccessToken = async (req, res) => {
  try {
    const token = await abhaService.getAccessToken();
    res.status(200).json({ success: true, accessToken: token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Send OTP for ABHA enrollment via Aadhaar
 */
export const sendAadhaarOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token =
      req.headers['accesstoken'] ??
      (await abhaService.getAccessTokenInternal());

    if (!access_token || !loginId) {
      return res.status(400).json({ success: false, message: 'accesstoken, loginId is required' });
    }
    
    const response = await Aadhaarenroll.sendAadhaarOtp(access_token, loginId);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message,
      error: error.response?.data || null
    });
  }
};

export const verifyAadhaarOtp = async (req, res) => {
  try {
    const { txnId, otpValue, mobile } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!accessToken || !txnId || !otpValue || !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId, otpValue, and mobile are required' 
      });
    }
    
    const response = await Aadhaarenroll.verifyAadhaarOtp({accessToken, txnId, otpValue, mobile });
    const token = extractToken(response);
    if (token) {
      setXTokenCookie(res, token);
    }

    res.status(200).json({ 
      success: true, 
      data: response.data || response,
      xToken: token,
    });
  } catch (error) {
    console.error('Error in verifyAadhaarOtp controller:', error);
    // Log error to DB with response
    const { logError } = await import('../utils/errorLogger.js');
    await logError('access_token/verifyAadhaarOtp', error.message, error.response || null);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying OTP',
      error: error.response || null
    });
  }
};

export const getphoto = async (req, res) => {
  try {
    const { photo } = req.body;
    const accessToken =
      req.headers['accesstoken'] ??
      (await abhaService.getAccessTokenInternal());
    const xToken = getXToken(req);
    if (!accessToken || !xToken || !photo){
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, xToken and photo are required' 
      });
    }
    
    const response = await Aadhaarenroll.getphoto({accessToken, xToken , photo });
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in fetching photo:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching photo',
      error: error.response || null
    });
  }
};

export const getProfileInfo = async (req, res) => {
  try {
    const xToken = getXToken(req);
    const accessToken =
      req.headers['accesstoken'] ??
      (await abhaService.getAccessTokenInternal());
    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'X-token and accessToken are required' 
      });
    }
    const response = await Aadhaarenroll.getProfileInfo(accessToken, xToken);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    const { logError } = await import('../utils/errorLogger.js');
    await logError('access_token/getProfileInfo', error.message, error.response || null);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching profile information',
      error: error.response || null
    });
  }
};

export const getQrCode = async (req, res) => {
  try {
    const xToken = getXToken(req);
    const accessToken =
      req.headers['accesstoken'] ??
      (await abhaService.getAccessTokenInternal());

    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'X-token and accessToken are required' 
      });
    }
    
    try {
      const response = await Aadhaarenroll.downloadQRCode(accessToken, xToken);
      
      // If successful, serve the QR code image
      const imagePath = path.join(process.cwd(), './qr_codes', 'abha_qr_code.png');
      
      // Check if file exists
      if (!fs.existsSync(imagePath)) {
        return res.status(404).json({
          success: false,
          message: 'QR code image not found'
        });
      }
      
      // Set appropriate headers for image response
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'inline; filename="qrcode.png"');
      
      // Send the image file
      res.sendFile(imagePath);
      
    } catch (downloadError) {
      // Return the exact API error response
      return res.status(downloadError.status || 500).json({
        success: false,
        message: downloadError.message || 'An error occurred while downloading QR Code',
        error: downloadError.response || null
      });
    }

  } catch (error) {
    console.error('Error in getQrCode controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching QR Code',
      error: error.response || null
    });
  }
};

export const getAbhaCard = async (req, res) => {
  try {
    const xToken = getXToken(req);
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'X-token and accessToken are required' 
      });
    }
    
    try {
      // Call the service to download the ABHA card
      const response = await Aadhaarenroll.getAbhaCard(accessToken, xToken);
      
      // Check for different possible file extensions
      const cardDirectory = path.join(process.cwd(), './abha_cards');
      const possibleExtensions = ['pdf', 'png', 'jpg', 'jpeg'];
      let cardPath = null;
      let contentType = 'application/pdf'; // Default to PDF
      let filename = 'abha_card.pdf'; // Default filename
      
      // Find the actual file that was downloaded
      for (const ext of possibleExtensions) {
        const testPath = path.join(cardDirectory, `abha_card.${ext}`);
        if (fs.existsSync(testPath)) {
          cardPath = testPath;
          
          // Set appropriate content type and filename based on extension
          switch (ext) {
            case 'pdf':
              contentType = 'application/pdf';
              filename = 'abha_card.pdf';
              break;
            case 'png':
              contentType = 'image/png';
              filename = 'abha_card.png';
              break;
            case 'jpg':
            case 'jpeg':
              contentType = 'image/jpeg';
              filename = `abha_card.${ext}`;
              break;
          }
          break;
        }
      }
      
      // Check if file exists
      if (!cardPath || !fs.existsSync(cardPath)) {
        return res.status(404).json({
          success: false,
          message: 'ABHA card file not found'
        });
      }
      
      // Set appropriate headers for file response
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      // Send the file
      res.sendFile(cardPath);
      
    } catch (downloadError) {
      // Return the exact API error response
      return res.status(downloadError.status || 500).json({
        success: false,
        message: downloadError.message || 'An error occurred while downloading ABHA Card',
        error: downloadError.response || null
      });
    }

  } catch (error) {
    console.error('Error in getAbhaCard controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching ABHA card',
      error: error.response || null
    });
  }
};

export const logout = async (req, res) => {
  try {
    const xToken = getXToken(req);
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    // Clear session cookies regardless
    clearXTokenCookie(res);

    if (!accessToken || !xToken) {
      return res.status(200).json({ 
        success: true, 
        message: 'Logged out successfully' 
      });
    }
    const response = await Aadhaarenroll.logout(accessToken, xToken);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in logout:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while logout',
      error: error.response || null
    });
  }
};

export const sendEmailVerificationLink = async (req, res) => {
  try {
    const { loginId } = req.body;
    const xToken = getXToken(req);
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!accessToken || !xToken || !loginId) {
      return res.status(400).json({ 
        success: false, 
        message: 'accessToken, X-token and loginId are required' 
      });
    }
    
    const response = await Aadhaarenroll.sendEmailVerificationLink(accessToken, xToken, loginId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in sendEmailVerificationLink:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while sending email verification link',
      error: error.response || null
    });
  }
};

export const getAbhaAddressSuggestions = async (req, res) => {
  try {
    const transactionId = req.headers['transaction-id'];
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!accessToken || !transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'accessToken and transaction-id are required in headers' 
      });
    }
    
    const response = await Aadhaarenroll.getAbhaAddressSuggestions(accessToken, transactionId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in getAbhaAddressSuggestions:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching ABHA address suggestions',
      error: error.response || null
    });
  }
};

export const createAbhaAddress = async (req, res) => {
  try {
    const { txnId, abhaAddress } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!accessToken || !txnId || !abhaAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'accessToken, txnId and abhaAddress are required' 
      });
    }
    
    const response = await Aadhaarenroll.createAbhaAddress(accessToken, txnId, abhaAddress);
    const token = extractToken(response);
    if (token) {
      setXTokenCookie(res, token);
    }

    res.status(200).json({ 
      success: true, 
      data: response.data || response,
      xToken: token,
    });
  } catch (error) {
    console.error('Error in createAbhaAddress:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while creating ABHA address',
      error: error.response || null
    });
  }
};
