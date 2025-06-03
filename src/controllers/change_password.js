import changePassword from '../models/change_password.js';
export const requestLoginOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'];
    const X_token = req.headers['xtoken'];
    if (!loginId || !X_token || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'password, X_token and accesstoken is required' 
      });
    }
    
    const response = await changePassword.requestLoginOtp(access_token, X_token, loginId);
    
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
    const X_token = req.headers['xtoken'];
    if (!accessToken || !X_token || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken,X_token , txnId and otp are required' 
      });
    }
    
    const response = await changePassword.verifyLoginOtp({accessToken, X_token, txnId, otp });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
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
