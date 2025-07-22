import abhaLogin from '../models/login_via_abha.js';
export const requestLoginOtp = async (req, res) => {
  try {
    const { abhaNumber } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!abhaNumber || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Abha number and accesstoken is required' 
      });
    }
    
    const response = await abhaLogin.requestLoginOtp(access_token, abhaNumber);
    
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
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId and otp are required' 
      });
    }
    
    const response = await abhaLogin.verifyLoginOtp({accessToken, txnId, otp });
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
    });
  } catch (error) {
    console.error('Error in verifyLoginOtp controller:', error);
    // Log error to DB with response
    const { logError } = await import('../utils/errorLogger.js');
    await logError('login_via_abha/verifyLoginOtp', error.message, error.response || null);
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying login OTP',
      error: error.response || null
    });
  }
};
