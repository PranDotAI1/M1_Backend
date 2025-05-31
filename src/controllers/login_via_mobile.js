import mobilelogin from '../models/login_via_mobile.js';
export const requestLoginOtp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!mobileNumber || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Mobile number and accesstoken is required' 
      });
    }
    
    const response = await mobilelogin.requestLoginOtp(access_token, mobileNumber);
    
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
    
    const response = await mobilelogin.verifyLoginOtp({accessToken, txnId, otp });
    
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
