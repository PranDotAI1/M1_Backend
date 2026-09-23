import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';


const requestLoginOtp = async (accessToken, X_token, password) => {
  try {

    if (!accessToken || !X_token || !password) {
      throw new Error('Missing required parameters: accessToken, X_token and password');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account/request/otp`, 
      {
        scope: [
            "abha-profile",
            "change-password"
        ],
        loginHint: "password",
        loginId: password,
        otpSystem: "aadhaar"
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${X_token}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString()
        }
      }
      );
    
    return response.data;
  } catch (error) {
    console.error('Error requesting login OTP:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to request login OTP',
      response: error.response?.data
    };
  }
};


const verifyLoginOtp = async ({ accessToken, X_token, txnId, otp }) => {
  try {
    
    if (!accessToken || !X_token || !txnId || !otp) {
      throw new Error('Missing required parameters: accessToken, X_token, txnId, otp');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account/verify`,
     {
    scope: [
        "abha-profile",
        "change-password"
    ],
    authData: {
        authMethods: [
            "otp"
        ],
        otp: {
            txnId: txnId,
            otpValue: otp
        }
    }
    
},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${X_token}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString()
        }
      }
      );
    
    // Return the response data along with the X-token from headers
    return {
      data: response.data,
  
    };
  } catch (error) {
    console.error('Error verifying login OTP:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to verify login OTP',
      response: error.response?.data
    };
  }
};

// Export all functions
export default {
  requestLoginOtp,
  verifyLoginOtp
};
