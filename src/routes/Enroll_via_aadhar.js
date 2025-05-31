import express from 'express';
import * as abhaController from '../controllers/access_token.js';
import * as loginController from '../controllers/login_via_mobile.js';


const router = express.Router();

router.post('/token', abhaController.getAccessToken);


router.post('/enrollment/aadhar/send-otp', abhaController.sendAadhaarOtp);
router.post('/enrollment/aadhar/verify-otp', abhaController.verifyAadhaarOtp);
router.get('/enrollment/aadhar/profile', abhaController.getProfileInfo);
router.post('/login/mobile/send-otp', loginController.requestLoginOtp);
router.post('/login/mobile/verify-otp', loginController.verifyLoginOtp);

export default router;
