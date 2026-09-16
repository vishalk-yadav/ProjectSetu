import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/register/citizen', AuthController.registerCitizen);
router.post('/verify-mobile-otp', AuthController.verifyMobileOtp);
router.post('/resend-mobile-otp', AuthController.resendMobileOtp);
router.post('/login', AuthController.login);
router.get('/me', authenticate, AuthController.me);
router.post('/logout', AuthController.logout);

export default router;
