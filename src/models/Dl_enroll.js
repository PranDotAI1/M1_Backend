import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';


dotenv.config();

const sendDlOtp = async (accessToken, loginId) => {
    try {

        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/enrollment/request/otp`,
            {
                scope: [
                    "abha-enrol",
                    "mobile-verify",
                    "dl-flow"
                ],
                loginHint: "mobile",
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
        console.error('Error sending OTP:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to send OTP');
    }
};


const verifyDlOtp = async ({ accessToken, txnId, otpValue }) => {
    try {

        if (!accessToken) {
            throw new Error('Missing required parameters: accessToken');
        }
        if (!txnId){
            throw new Error('Transaction ID (txnId) is required');
        }
        if (!otpValue){
            throw new Error('OTP is required');
        }

        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/enrollment/auth/byAbdm`,
            {
                scope: [
                    "abha-enrol",
                    "mobile-verify",
                    "dl-flow"
                ],
                authData: {
                    authMethods: [
                        "otp"
                    ],
                    otp: {
                        timeStamp: new Date().toISOString(),
                        txnId: txnId,
                        otpValue: otpValue
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
        console.error('Error verifying OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to verify OTP',
            response: error.response?.data
        };
    }
};


const createENumber = async ({ accessToken, txnId,  DL_number, First_Name, Middle_Name, Last_Name, d_o_b, gender, base_front_photo, base_back_photo, Address, state, District, Pincode }) => {
    try {

    

        const response = await axios.post(
            `${config.abdm.abhaBaseUrl}/api/v3/enrollment/enrol/byDocument`,
            {
                txnId: txnId,
                documentType: "DRIVING_LICENCE",
                documentId: DL_number,
                firstName: First_Name,
                middleName: Middle_Name,
                lastName: Last_Name,
                dob: d_o_b,
                gender: gender,
                frontSidePhoto: base_front_photo,
                backSidePhoto: base_back_photo,
                address: Address,
                state: state,
                district: District,
                pinCode: Pincode,
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

        // Return the response data along with the X-token from headers
        return {
            data: response.data,
        };
    } catch (error) {
        console.error('Error verifying OTP:', error.response?.data || error.message);
        throw {
            status: error.response?.status || 500,
            message: error.response?.data?.message || 'Failed to verify OTP',
            response: error.response?.data
        };
    }
};
export default {
    sendDlOtp,
    verifyDlOtp,
    createENumber
};