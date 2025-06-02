import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';


dotenv.config();

const sendAadhaarOtp = async (accessToken, loginId) => {
  try {

    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/enrollment/request/otp`,
      {
        txnId: "",
        scope: ["abha-enrol"],
        loginHint: "aadhaar",
        loginId: loginId,
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
    console.error('Error sending OTP:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to send OTP');
  }
};


const verifyAadhaarOtp = async ({ accessToken, txnId, otpValue, mobile }) => {
  try {


    if (!accessToken || !txnId || !otpValue || !mobile) {
      throw new Error('Missing required parameters: accesstoken, txnId, otpValue, or mobile');
    }


    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/enrollment/enrol/byAadhaar`,
      {
        authData: {
          authMethods: ["otp"],
          otp: {
            txnId: txnId,
            otpValue: otpValue,
            mobile: mobile
          }
        },
        consent: {
          code: "abha-enrollment",
          version: "1.4"
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

    return response.data;
  } catch (error) {
    console.error('Error verifying OTP:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to verify OTP',
      response: error.response?.data
    };
  }
};

//  Get ABHA profile information

const getProfileInfo = async (accessToken, xToken) => {
  try {
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${xToken}`,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString(),
          'User-Agent': 'ABHA-Integration/1.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching profile info:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to fetch profile information',
      response: error.response?.data
    };
  }
};

const getAbhaCard = async (accessToken, xToken) => {
  try {
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account/abha-card`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${xToken}`,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString(),
          'User-Agent': 'ABHA-Integration/1.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching Abha card info:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to fetch Abha card information',
      response: error.response?.data
    };
  }
};


const getQrCode = async (accessToken, xToken) => {
  try {
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account/qrCode`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${xToken}`,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString(),
          'User-Agent': 'ABHA-Integration/1.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error fetching QRcode info:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to fetch QRcode information',
      response: error.response?.data
    };
  }
};

const getphoto = async ({ accessToken, xToken, photo }) => {
  try {


    if (!accessToken || !xToken || !photo) {
      throw new Error('Missing required parameters: accesstoken, xtoken or photo');
    }

    const response = await axios.patch(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account`,

      {
        profilePhoto: photo
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${xToken}`,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString(),
          'User-Agent': 'ABHA-Integration/1.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in changing the Photo :', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to update photo',
      response: error.response?.data
    };
  }
};


const logout = async (accessToken, xToken) => {
  try {
    const response = await axios.get(
      `${config.abdm.abhaBaseUrl}/api/v3/profile/account/request/logout`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-token': `Bearer ${xToken}`,
          'REQUEST-ID': crypto.randomUUID(),
          'TIMESTAMP': new Date().toISOString(),
          'User-Agent': 'ABHA-Integration/1.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error in logout:', error.response?.data || error.message);
    throw {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Failed to logout',
      response: error.response?.data
    };
  }
};




export default {
  sendAadhaarOtp,
  verifyAadhaarOtp,
  getProfileInfo,
  getQrCode,
  getAbhaCard,
  getphoto,
  logout
};