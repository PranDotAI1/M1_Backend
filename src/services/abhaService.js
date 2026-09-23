import axios from 'axios';
import config from '../config/index.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

let inMemoryToken = null;
let lastTokenTime = null;

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
        grantType: 'client_credentials',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'REQUEST-ID': crypto.randomUUID(),
          Accept: 'application/json',
          'X-CM-ID': 'sbx',
          TIMESTAMP: new Date().toISOString(),
        },
      }
    );

    const token = response.data.accessToken;
    inMemoryToken = token;
    lastTokenTime = Date.now();
    return token;
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    // Add more detailed error logging
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    }
    const err = new Error(error.response?.data?.message || error.message || 'Failed to get access token');
    err.status = error.response?.status || 500;
    err.response = error.response?.data || null;
    throw err;
  }
};

const getTokenInMemory = () => {
  if (inMemoryToken && lastTokenTime && Date.now() - lastTokenTime < 360000) {
    return inMemoryToken;
  }
  return null;
};

let inFlightPromise = null;

const getAccessTokenInternal = async () => {
  const cachedToken = getTokenInMemory();
  if (cachedToken) return cachedToken;

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async () => {
    try {
      return await getAccessToken();
    } finally {
      inFlightPromise = null;
    }
  })();

  return inFlightPromise;
};

export default {
  getAccessToken,
  getAccessTokenInternal,
};
