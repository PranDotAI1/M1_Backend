import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();  


// Cache for the access token
let accessTokenCache = {
  token: null,
  expiresAt: null
};

/**
 * Get access token for ABDM APIs
 */
const getAccessToken = async () => {
  // Check if we have a valid cached token
  if (accessTokenCache.token && accessTokenCache.expiresAt > Date.now()) {
    return accessTokenCache.token;
  }

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

    // Cache the token (assuming it expires in 20 min)
    accessTokenCache.token = response.data.accessToken;
    accessTokenCache.expiresAt = Date.now() + 1200000; // 20 min  from now
    
    return response.data;
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
