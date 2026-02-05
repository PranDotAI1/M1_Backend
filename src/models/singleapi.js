import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';


const requestLoginOtp = async (accessToken, loginId) => {
  try {

    if (!accessToken || !loginId) {
      throw new Error('Missing required parameters: accessToken and mobileNumber');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/abha/request/otp`,
      {
        scope: [
                "abha-address-login",
                "mobile-verify"],
        loginHint: "abha-address",
        loginId: loginId,
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
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/abha/verify`,
     {
    scope: [
        "abha-address-login",
        "mobile-verify"],

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
      xToken: response.headers['x-token'] // This will be passed to frontend
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




const searchprofile = async (accessToken, address) => {
  try {

    if (!accessToken || !address) {
      throw new Error('Missing required parameters: accessToken and address');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/abha/search`,
      {
        abhaAddress: address,
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



const profileAddress = async ({ accessToken, xToken}) => {
  try {
    
    if (!accessToken || !xToken) {
      throw new Error('Missing required parameters: accessToken, xToken');
    }
    
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/profile/abha-profile`,

      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-token': xToken,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString()
        }
      }
    );
    
    // Return the response data along with the X-token from headers
    return {
      data: response.data
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

const CardbyAddress = async ({ accessToken, xToken}) => {
  try {
    
    if (!accessToken || !xToken) {
      throw new Error('Missing required parameters: accessToken, xToken');
    }
    
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/profile/abha/phr-card`,

      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-token': xToken,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString()
        }
      }
    );
    
    // Return the response data along with the X-token from headers
    return {
      data: response.data
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



const fetchAbha = async (accessToken, loginId) => {
  try {

    if (!accessToken || !loginId) {
      throw new Error('Missing required parameters: accessToken and mobileNumber');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/search`,
      {
        loginId: loginId,
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


const verifypass = async ({ accessToken, loginId, password }) => {
  try {
    
    if (!accessToken || !loginId || !password) {
      throw new Error('Missing required parameters: accessToken, loginId, password');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/login/verify`,
     {
    scope: [
        "abha-login",
        "password-verify"
    ],
    authData: {
        authMethods: [
            "password"
        ],
        password: {
            ABHANumber: loginId,
            password: password
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
      xToken: response.headers['x-token'] // This will be passed to frontend
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
  verifyLoginOtp,
  fetchAbha,
  verifypass,
  profileAddress,
  CardbyAddress,
  searchprofile
};
