import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';


const requestMobileOtp = async (accessToken, mobile) => {
  try {

    if (!accessToken || !mobile) {
      throw new Error('Missing required parameters: accessToken and mobile');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/request/otp`,
      {
        scope: [
            "abha-login",
            "mobile-verify"
        ],
        loginHint: "mobile",
        loginId: mobile,
        otpSystem: "abdm"
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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


const verifyMobileOtp = async ({ accessToken, txnId, otp }) => {
  try {
    
    if (!accessToken || !txnId || !otp) {
      throw new Error('Missing required parameters: accessToken, txnId, otp');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/verify`,
     {
    scope: [
        "abha-login",
        "mobile-verify"
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


const requestAadharOtp = async (accessToken, aadhar) => {
  try {

    if (!accessToken || !aadhar) {
      throw new Error('Missing required parameters: accessToken and aadhar');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/request/otp`,
      {
        scope: [
            "abha-login",
            "aadhaar-verify"
        ],
        loginHint: "aadhaar",
        loginId: aadhar,
        otpSystem: "aadhaar"
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
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


const verifyAadharOtp = async ({ accessToken, txnId, otp }) => {
  try {
    
    if (!accessToken || !txnId || !otp) {
      throw new Error('Missing required parameters: accessToken, txnId, otp');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/verify`,
     {
    scope: [
        "abha-login",
        "aadhaar-verify"
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
    requestMobileOtp,
    verifyMobileOtp,
    requestAadharOtp,
    verifyAadharOtp
};
