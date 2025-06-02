import forgot from '../models/forgot.js';

export const requestMobileOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!mobile || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'mobile and accesstoken is required' 
      });
    }
    
    const response = await forgot.requestMobileOtp(access_token, mobile);
    
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

export const verifyMobileOtp = async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken, txnId and otp are required' 
      });
    }
    
    const response = await forgot.verifyMobileOtp({accessToken, txnId, otp });
    
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


export const requestAadharOtp = async (req, res) => {
  try {
    const { aadhar } = req.body;
    const access_token = req.headers['accesstoken'];
    if (!aadhar || !access_token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aadhar number and accesstoken is required' 
      });
    }
    
    const response = await forgot.requestAadharOtp(access_token, aadhar);
    
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

export const verifyAadharOtp = async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'];
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'accesstoken , txnId and otp are required' 
      });
    }
    
    const response = await forgot.verifyAadharOtp({accessToken, txnId, otp });
    
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
