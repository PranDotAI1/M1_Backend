import express from 'express';
import * as abhaenrollController from '../controllers/access_token.js';
import * as loginmobileController from '../controllers/login_via_mobile.js';
import * as loginaadharController from '../controllers/login_via_aadhar.js';
import * as loginabhaController from '../controllers/login_via_abha.js';
import * as loginabhanumberController from '../controllers/login_via_abha_number.js';

const router = express.Router();

router.post('/token', abhaenrollController.getAccessToken);


router.post('/enrollment/aadhar/send-otp', abhaenrollController.sendAadhaarOtp);
router.post('/enrollment/aadhar/verify-otp', abhaenrollController.verifyAadhaarOtp);
router.get('/profile', abhaenrollController.getProfileInfo);
router.post('/login/mobile/send-otp', loginmobileController.requestLoginOtp);
router.post('/login/mobile/verify-otp', loginmobileController.verifyLoginOtp);
router.post('/login/aadhar/send-otp', loginaadharController.requestLoginOtp);
router.post('/login/aadhar/verify-otp', loginaadharController.verifyLoginOtp);
router.post('/login/abha/send-otp', loginabhaController.requestLoginOtp);
router.post('/login/abha/verify-otp', loginabhaController.verifyLoginOtp);
router.get('/profile/qrcode', abhaenrollController.getQrCode);
router.post('/login/abha/number/send-otp', loginabhanumberController.requestLoginOtp);
router.post('/login/abha/number/verify-otp', loginabhanumberController.verifyLoginOtp);
export default router;
