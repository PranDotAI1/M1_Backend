import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import https from 'https';

// Helper functions
function generateRequestId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function generateTimestamp() {
    return new Date().toISOString();
}


const requestLoginOtp = async (accessToken, loginId, verify, otpsystem) => {
  try {

    if (!accessToken || !loginId || !verify || !otpsystem) {
      throw new Error('Missing required parameters: accessToken, loginId, verify and otpsystem');
    }
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/abha/request/otp`,
      {
        scope: [
                "abha-address-login",
                verify],
        loginHint: "abha-address",
        loginId: loginId,
        otpSystem: otpsystem
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




const verifyLoginOtp = async ({ accessToken, txnId, otp, verify }) => {
  try {
    
    if (!accessToken || !txnId || !otp || !verify) {
      throw new Error('Missing required parameters: accessToken, txnId, otp and verify');
    }
    
    const response = await axios.post(
      `${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/abha/verify`,
     {
    scope: [
        "abha-address-login",
        verify],

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
          'X-token': `Bearer ${xToken}`,
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

const CardbyAddress = ({ accessToken, xToken }) => {
  return new Promise((resolve, reject) => {
    const url = new URL(`${config.abdm.abhaBaseUrl}/api/v3/phr/web/login/profile/abha/phr-card`);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'NodeJS-ABHA-Client/1.0.0',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'X-token': `Bearer ${xToken}`,
        'REQUEST-ID': generateRequestId(),
        'TIMESTAMP': generateTimestamp()
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 202) {
        // Determine file extension based on content type
        const contentType = res.headers['content-type'] || '';
        let fileExtension = 'pdf'; // Default to PDF
        
        if (contentType.includes('image/png')) {
          fileExtension = 'png';
        } else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) {
          fileExtension = 'jpg';
        } else if (contentType.includes('application/pdf')) {
          fileExtension = 'pdf';
        }

        const filePath = path.join('./abha_cards', `phr_card_by_address.${fileExtension}`);
        const fileStream = fs.createWriteStream(filePath);
        
        res.pipe(fileStream);
        
        fileStream.on('finish', () => {
          fileStream.close();
          const stats = fs.statSync(filePath);
          resolve({ success: true, filePath, size: stats.size, extension: fileExtension });
        });
        
        fileStream.on('error', (err) => {
          fs.unlink(filePath, () => {}); // Delete the file on error
          reject({
            status: 500,
            message: 'Error writing PHR Card file',
            response: { error: err.message }
          });
        });
      } else {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          let errorResponse;
          try {
            errorResponse = JSON.parse(data);
          } catch (e) {
            errorResponse = { error: data };
          }
          reject({
            status: res.statusCode,
            message: errorResponse.message || `API Error: ${res.statusCode}`,
            response: errorResponse
          });
        });
      }
    });

    req.on('error', (err) => {
      reject({
        status: 500,
        message: 'Network error while downloading PHR Card',
        response: { error: err.message }
      });
    });

    req.end();
  });
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
