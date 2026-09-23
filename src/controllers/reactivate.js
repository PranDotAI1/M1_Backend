import reactivate from '../models/reactivate.js';
import abhaService from '../services/abhaService.js';
import { setXTokenCookie, extractToken } from '../utils/cookieHelper.js';

export const requestLoginOtp = async (req, res) => {
  try {
    const { loginId } = req.body;
    const access_token = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());

    if (!loginId || !access_token) {
      return res.status(400).json({
        success: false,
        message: 'Abha number and accesstoken is required',
      });
    }

    const response = await reactivate.requestLoginOtp(access_token, loginId);

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Error in requestLoginOtp controller:', error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'An error occurred while requesting login OTP',
      error: error.response || null,
    });
  }
};

// Verify OTP for ABHA login

export const verifyLoginOtp = async (req, res) => {
  try {
    const { txnId, otp } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!accessToken || !txnId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'accesstoken, txnId and otp are required',
      });
    }

    const response = await reactivate.verifyLoginOtp({ accessToken, txnId, otp });
    const token = extractToken(response);
    if (token) {
      setXTokenCookie(res, token);
    }

    res.status(200).json({
      success: true,
      data: response.data || response,
      xToken: token,
    });
  } catch (error) {
    console.error('Error in verifyLoginOtp controller:', error);

    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'An error occurred while verifying login OTP',
      error: error.response || null,
    });
  }
};
