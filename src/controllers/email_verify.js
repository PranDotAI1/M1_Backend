import verifyemail from '../models/email_verify.js';
export const requestOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'];
    const X_token = req.headers['xtoken'];
    if (!loginId || !X_token || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'email, X_token and accesstoken is required' 
      });
    }
    
    const response = await verifyemail.requestOtp(access_token, X_token, loginId);
    
    res.status(200).json({ 
      success: true, 
      data: response 
    });
  } catch (error) {
    console.error('Error in requestOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while requesting OTP',
      error: error.response || null
    });
  }
};


// Verify OTP for ABHA login

export const verifyOtp = async (req, res) => {
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
    
    const response = await verifyemail.verifyOtp({accessToken, X_token, txnId, otp });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
    });
  } catch (error) {
    console.error('Error in verifyOtp controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying OTP',
      error: error.response || null
    });
  }
};

