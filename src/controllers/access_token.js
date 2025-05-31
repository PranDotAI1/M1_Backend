import abhaService from '../services/abhaService.js';

import Aadhaarenroll from '../models/Enroll_via_aadhar.js';

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
    const access_token = req.headers['accesstoken'];
    
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
    // 
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otpValue || !mobile) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId, otpValue, and mobile are required' 
      });
    }
    
    const response = await Aadhaarenroll.verifyAadhaarOtp({accessToken, txnId, otpValue, mobile });
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in verifyAadhaarOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying OTP',
      error: error.response || null
    });
  }
};


export const getProfileInfo = async (req, res) => {

  try {
    // Get X-token from request headers
    const xToken = req.headers['x-token'];
    const accessToken = req.headers['accesstoken'];
    
    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'X-token and accessToken is required in request headers' 
      });
    }
    const response = await Aadhaarenroll.getProfileInfo(accessToken, xToken);
    
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in getProfileInfo controller:', error);
    
    res.status(error.response?.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching profile information',
      error: error.response?.data || null
    });
  }
};


export const getQrCode = async (req, res) => {

  try {
    // Get X-token from request headers
    const xToken = req.headers['x-token'];
    const accessToken = req.headers['accesstoken'];
    
    if (!accessToken || !xToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'X-token and accessToken is required in request headers' 
      });
    }
    const response = await Aadhaarenroll.getQrCode(accessToken, xToken);
    
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in getQrCodeinfo controller:', error);
    
    res.status(error.response?.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while fetching QRCode information',
      error: error.response?.data || null
    });
  }
};
