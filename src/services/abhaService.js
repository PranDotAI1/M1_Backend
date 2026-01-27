import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();  


/**
 * Get access token for ABDM APIs - Always fetches a fresh token
 */
const getAccessToken = async () => {
  try {
    const response = await axios.post(
        `${config.abdm.baseUrl}/sessions`,
        {
          clientId: config.abdm.clientId,
          clientSecret: config.abdm.clientSecret,
          grantType: 'client_credentials'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'REQUEST-ID': crypto.randomUUID(),
            'Accept': 'application/json',
            'X-CM-ID': 'sbx',
            'TIMESTAMP': new Date().toISOString()
          }
        }
      );

    // Return only the accessToken string for consistent response
    return response.data.accessToken;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    // Add more detailed error logging
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    throw new Error('Failed to get access token');
  }
};


export default {
  getAccessToken,

};
