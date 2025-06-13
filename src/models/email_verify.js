import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';


const requestOtp = async (accessToken, X_token, email) => {
    try {

        if (!accessToken || !X_token || !email) {
            throw new Error('Missing required parameters: accessToken, X_token and email');
        }
        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/profile/account/request/otp`,
            {
                scope: [
                    "abha-profile",
                    "email-verify"
                ],
                loginHint: "email",
                loginId: email,
                otpSystem: "abdm"
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
        console.error('Error requesting OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to request  OTP',
            response: error.response?.data
        };
    }
};


const verifyOtp = async ({ accessToken, X_token, txnId, otp }) => {
    try {

        if (!accessToken || !X_token || !txnId || !otp) {
            throw new Error('Missing required parameters: accessToken, X_token, txnId, otp');
        }

        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/profile/account/verify`,
            {
                scope: [
                    "abha-profile",
                    "email-verify"
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
        console.error('Error in verifying OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to verify OTP',
            response: error.response?.data
        };
    }
};




const requestMobileOtp = async (accessToken, X_token, mobile) => {
    try {

        if (!accessToken || !X_token || !mobile) {
            throw new Error('Missing required parameters: accessToken, X_token and mobile number');
        }
        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/profile/account/request/otp`,
            {
                scope: [
                    "abha-profile",
                    "mobile-verify"
                ],
                loginHint: "mobile",
                loginId: mobile,
                otpSystem: "abdm"
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
        console.error('Error requesting OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to request  OTP',
            response: error.response?.data
        };
    }
};


const verifyMobileOtp = async ({ accessToken, X_token, txnId, otp }) => {
    try {

        if (!accessToken || !X_token || !txnId || !otp) {
            throw new Error('Missing required parameters: accessToken, X_token, txnId, otp');
        }

        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/profile/account/verify`,
            {
                scope: [
                    "abha-profile",
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
        console.error('Error in verifying OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to verify OTP',
            response: error.response?.data
        };
    }
};


// Export all functions
export default {
    requestOtp,
    verifyOtp,
    requestMobileOtp,
    verifyMobileOtp
};







