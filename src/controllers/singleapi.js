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

export const verifyuser = async (req, res) => {
  try {
    const { txnId, abhanumber } = req.body;
    const accessToken = req.headers['accesstoken'];
    const Ttoken = req.headers['t-token'];
    if (!accessToken || !txnId || !abhanumber || !Ttoken) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId, abhanumber and Ttoken are required' 
      });
    }
    
    const response = await mobilelogin.verifyuser({accessToken, Ttoken, txnId, abhanumber });
    
    // Return both the data and the X-token to the frontend
    res.status(200).json({ 
      success: true, 
      data: response.data,
      xToken: response.xToken // Frontend will store this
    });
  } catch (error) {
    console.error('Error in verifyuser controller:', error);
    
    res.status(error.status || 500).json({ 
      success: false, 
      message: error.message || 'An error occurred while verifying user',
      error: error.response || null
    });
  }
};
