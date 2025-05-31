import dotenv from 'dotenv';
dotenv.config();
export default {
  abdm: {
    baseUrl: process.env.Access_token_uri,
    abhaBaseUrl: process.env.Base_uri,
    clientId: process.env.ABDM_CLIENT_ID,
    clientSecret: process.env.ABDM_CLIENT_SECRET
  }
};


