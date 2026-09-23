import findabha from '../models/findabha.js';
import abhaService from '../services/abhaService.js';
import { setXTokenCookie, extractToken } from '../utils/cookieHelper.js';


export const searchAbha = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!loginId || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'mobile and accesstoken is required' 
      });
    }
    
    const response = await findabha.searchabha(access_token, loginId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in requestLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while requesting login OTP',
      error: error.response || null
    });
  }
};

export const requestindexOtp = async (req, res) => {
  try {
    const { txnId, loginId } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!loginId || !accessToken || !txnId) {
      return res.status(400).json({ 
        success: false, 
        message: 'mobile, accesstoken and txnId are required' 
      });
    }
    
    const response = await findabha.sendindexotp({ accessToken, txnId, indexid: loginId });
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in requestIndexOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while requesting index OTP',
      error: error.response || null
    });
  }
};

// Verify OTP for ABHA login

export const verifyindexOtp = async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId and otp are required' 
      });
    }
    
    const response = await findabha.verifyindexOtp({accessToken, txnId, otp });
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
    console.error('Error in verifyLoginOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying login OTP',
      error: error.response || null
    });
  }
};