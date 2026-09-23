import DLenroll from '../models/Dl_enroll.js';
import abhaService from '../services/abhaService.js';
import { setXTokenCookie, extractToken } from '../utils/cookieHelper.js';

export const sendDlOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!access_token || !loginId) {
      return res.status(400).json({ success: false, message: 'accesstoken, loginId is required' });
    }
    
    const response = await DLenroll.sendDlOtp(access_token, loginId);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message,
      error: error.response?.data || null
    });
  }
};




export const verifyDlOtp = async (req, res) => {
  try {
    const { txnId, otpValue } = req.body;
    console.log(req.headers, req.body);
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!accessToken || !txnId || !otpValue) {
      return res.status(400).json({
        success: false,
        message: 'accesstoken, txnId and otpValue are required',
      });
    }
    
    const response = await DLenroll.verifyDlOtp({accessToken, txnId, otpValue });
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
    console.error('Error in verifyDlOtp controller:', error);
    // Log error to DB with response
    const { logError } = await import('../utils/errorLogger.js');
    await logError('Dl_enroll/verifyDlOtp', error.message, error.response || null);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying OTP',
      error: error.response || null
    });
  }
};

export const createENumber = async (req, res) => {
  try {
    const { txnId,  DL_number, First_Name, Middle_Name, Last_Name, d_o_b, gender, base_front_photo, base_back_photo, Address, state, District, Pincode } = req.body;
    // 
    const accessToken = req.headers['accesstoken'] ??  (await abhaService.getAccessTokenInternal());

    const response = await DLenroll.createENumber({accessToken, txnId, DL_number, First_Name, Middle_Name, Last_Name, d_o_b, gender, base_front_photo, base_back_photo, Address, state, District, Pincode });
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
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying OTP',
      error: error.response || null
    });
  }
};
