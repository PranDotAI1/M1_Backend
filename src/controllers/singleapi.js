import mobilelogin from '../models/singleapi.js';
export const requestLoginOtp = async (req, res) => {
  try {
    const { scope, loginHint, loginId, otpSystem } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!loginId || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.requestLoginOtp(access_token, loginId, scope, loginHint, otpSystem);
    
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


// Verify OTP for ABHA login

export const verifyLoginOtp = async (req, res) => {
  try {
    const { scope, txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId and otp are required' 
      });
    }
    
    const response = await mobilelogin.verifyLoginOtp({accessToken, scope, txnId, otp });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
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


export const fetchAbha = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!loginId || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Abha number and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.fetchAbha(access_token, loginId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in fetch Abha controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while login with ABHA',
      error: error.response || null
    });
  }
};


// Verify OTP for ABHA login

export const verifypass = async (req, res) => {
  try {
    console.log('Access Token:', req.headers, req.body);
    const { loginId, password } = req.body;
    const accessToken = req.headers['accesstoken'];
    console.log('Access Token:', req.headers, req.body);
    if (!accessToken || !loginId || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, loginId and password are required' 
      });
    }
    
    const response = await mobilelogin.verifypass({accessToken, loginId, password });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
    });
  } catch (error) {
    console.error('Error in verify password controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while login with ABHA',
      error: error.response || null
    });
  }
};


