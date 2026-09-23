import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';


const requestLoginOtp = async (accessToken, mobileNumber) => {
  try {

    if (!accessToken || !mobileNumber) {
      throw new Error('Missing required parameters: accessToken and mobileNumber');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/request/otp`,
      {
        scope: [
          "abha-login",
          "mobile-verify"
        ],
        loginHint: "mobile",
        loginId: mobileNumber,
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


const verifyLoginOtp = async ({ accessToken, txnId, otp }) => {
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
    
    // Return the response data along with the X-token from headers or body
    const xToken =
      response.headers?.['x-token'] ||
      response.headers?.['xtoken'] ||
      response.headers?.['X-token'] ||
      response.data?.token ||
      response.data?.tokens?.token;

    return {
      data: response.data,
      xToken,
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

const verifyuser = async ({ accessToken,  Ttoken, txnId, abhanumber }) => {
  try {
    
    if (!accessToken || !txnId || !abhanumber || !Ttoken) {
      throw new Error('Missing required parameters: accessToken, txnId, abhanumber, Ttoken');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/verify/user`,
     {
    ABHANumber : abhanumber,
    txnId : txnId,
},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'T-token': `Bearer ${Ttoken}`,
          'Content-Type': 'application/json',
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString()
        }
      }
    );
    
    // Return the response data along with the X-token from headers or body
    const xToken =
      response.headers?.['x-token'] ||
      response.headers?.['xtoken'] ||
      response.headers?.['X-token'] ||
      response.data?.token ||
      response.data?.tokens?.token;

    return {
      data: response.data,
      xToken,
    };
  } catch (error) {
    console.error('Error verifying user:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to verify user',
      response: error.response?.data
    };
  }
};

// Export all functions
export default {
  requestLoginOtp,
  verifyLoginOtp,
  verifyuser
};
