import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import https from 'https';

dotenv.config();

// Function to clear folders
const clearFolders = () => {
  const folders = ['./qr_codes', './abha_cards'];
  
  folders.forEach(folder => {
    if (fs.existsSync(folder)) {
      const files = fs.readdirSync(folder);
      files.forEach(file => {
        const filePath = path.join(folder, file);
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filePath}`);
        } catch (error) {
          console.error(`Error deleting file ${filePath}:`, error);
        }
      });
    }
  });
};

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

// Get ABHA profile information
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

// Create output folders if they don't exist and clear them
if (!fs.existsSync('./qr_codes')) {
    fs.mkdirSync('./qr_codes', { recursive: true });
}

if (!fs.existsSync('./abha_cards')) {
    fs.mkdirSync('./abha_cards', { recursive: true });
}

// Clear folders on module load
clearFolders();

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

function downloadQRCode(accessToken, xtoken) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${config.abdm.abhaBaseUrl}/api/v3/profile/account/qrCode`);
        
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
                'X-token': `Bearer ${xtoken}`,
                'REQUEST-ID': generateRequestId(),
                'TIMESTAMP': generateTimestamp()
            }
        };

        console.log('Making request to ABHA API for QR Code...');
        
        const req = https.request(options, (res) => {
            console.log(`QR Code Status Code: ${res.statusCode}`);
            console.log(`QR Code Headers:`, res.headers);

            if (res.statusCode === 200 || res.statusCode === 202) {
                const filePath = path.join('./qr_codes', 'abha_qr_code.png');
                const fileStream = fs.createWriteStream(filePath);
                
                res.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`QR Code saved successfully to: ${filePath}`);
                    
                    // Get file size
                    const stats = fs.statSync(filePath);
                    console.log(`QR Code file size: ${(stats.size / 1024).toFixed(2)} KB`);
                    resolve({ success: true, filePath, size: stats.size });
                });
                
                fileStream.on('error', (err) => {
                    console.error('Error writing QR Code file:', err);
                    fs.unlink(filePath, () => {}); // Delete the file on error
                    reject({
                        status: 500,
                        message: 'Error writing QR Code file',
                        response: { error: err.message }
                    });
                });
            } else {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.error(`QR Code API Error (${res.statusCode}):`, data);
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
            console.error('QR Code Request Error:', err);
            reject({
                status: 500,
                message: 'Network error while downloading QR Code',
                response: { error: err.message }
            });
        });

        req.on('timeout', () => {
            console.error('QR Code Request timeout');
            req.destroy();
            reject({
                status: 408,
                message: 'Request timeout while downloading QR Code',
                response: { error: 'Timeout' }
            });
        });

        req.setTimeout(30000); // 30 seconds timeout
        req.end();
    });
}

// Modified getAbhaCard function to download and save the ABHA card
function getAbhaCard(accessToken, xtoken) {
    return new Promise((resolve, reject) => {
        const url = new URL(`${config.abdm.abhaBaseUrl}/api/v3/profile/account/abha-card`);
        
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
                'X-token': `Bearer ${xtoken}`,
                'REQUEST-ID': generateRequestId(),
                'TIMESTAMP': generateTimestamp()
            }
        };

        console.log('Making request to ABHA API for ABHA Card...');
        
        const req = https.request(options, (res) => {
            console.log(`ABHA Card Status Code: ${res.statusCode}`);
            console.log(`ABHA Card Headers:`, res.headers);

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

                const filePath = path.join('./abha_cards', `abha_card.${fileExtension}`);
                const fileStream = fs.createWriteStream(filePath);
                
                res.pipe(fileStream);
                
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log(`ABHA Card saved successfully to: ${filePath}`);
                    
                    // Get file size
                    const stats = fs.statSync(filePath);
                    console.log(`ABHA Card file size: ${(stats.size / 1024).toFixed(2)} KB`);
                    resolve({ success: true, filePath, size: stats.size, extension: fileExtension });
                });
                
                fileStream.on('error', (err) => {
                    console.error('Error writing ABHA Card file:', err);
                    fs.unlink(filePath, () => {}); // Delete the file on error
                    reject({
                        status: 500,
                        message: 'Error writing ABHA Card file',
                        response: { error: err.message }
                    });
                });
            } else {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.error(`ABHA Card API Error (${res.statusCode}):`, data);
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
            console.error('ABHA Card Request Error:', err);
            reject({
                status: 500,
                message: 'Network error while downloading ABHA Card',
                response: { error: err.message }
            });
        });

        req.on('timeout', () => {
            console.error('ABHA Card Request timeout');
            req.destroy();
            reject({
                status: 408,
                message: 'Request timeout while downloading ABHA Card',
                response: { error: 'Timeout' }
            });
        });

        req.setTimeout(30000); // 30 seconds timeout
        req.end();
    });
}

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
  downloadQRCode,
  getAbhaCard,
  getphoto,
  logout,
  clearFolders
};
