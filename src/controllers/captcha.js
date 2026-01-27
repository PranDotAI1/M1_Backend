import { generateCaptchaSession, generateCaptchaImage, verifyCaptcha } from '../utils/captchaGenerator.js';

/**
 * Generate a new captcha
 */
export const generateCaptcha = async (req, res) => {
  try {
    const { sessionId, captchaText } = generateCaptchaSession();
    const captchaImage = generateCaptchaImage(captchaText);
    
    res.status(200).json({
      success: true,
      data: {
        sessionId,
        captchaImage, // Base64 encoded SVG image
        captchaText   // Text for audio playback
      }
    });
  } catch (error) {
    console.error('Error generating captcha:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate captcha'
    });
  }
};

/**
 * Verify captcha (optional - for endpoints that need validation)
 */
export const validateCaptcha = async (req, res) => {
  try {
    const { sessionId, captcha } = req.body;
    
    if (!sessionId || !captcha) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and captcha are required'
      });
    }
    
    const isValid = verifyCaptcha(sessionId, captcha);
    
    res.status(200).json({
      success: true,
      valid: isValid
    });
  } catch (error) {
    console.error('Error validating captcha:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate captcha'
    });
  }
};

export default {
  generateCaptcha,
  validateCaptcha
};
