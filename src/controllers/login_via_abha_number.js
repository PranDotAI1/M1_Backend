import abhanumberLogin from '../models/login_via_abha_number.js';
import abhaService from '../services/abhaService.js';
import { setXTokenCookie, extractToken } from '../utils/cookieHelper.js';

export const requestLoginOtp = async (req, res) => {
  try {
    const { abhaNumber, verify, otpsystem } = req.body;
    const access_token = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!abhaNumber || !access_token || !verify || !otpsystem) {
      return res.status(400).json({
        success: false,
        message: 'Abha number, accesstoken, verify and otpsystem are required',
      });
    }

    const response = await abhanumberLogin.requestLoginOtp(
      access_token,
      abhaNumber,
      verify,
      otpsystem
    );

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
    const { txnId, otp, verify } = req.body;
    const accessToken = req.headers['accesstoken'] ?? (await abhaService.getAccessTokenInternal());
    if (!accessToken || !txnId || !otp || !verify) {
      return res.status(400).json({
        success: false,
        message: 'accesstoken, txnId, otp and verify are required',
      });
    }

    const response = await abhanumberLogin.verifyLoginOtp({ accessToken, txnId, otp, verify });
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
