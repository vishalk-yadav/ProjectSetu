import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';

export class AuthController {
  /**
   * Citizen signup endpoint: Mobile + Password + OTP dispatch.
   * POST /api/auth/register/citizen
   */
  static async registerCitizen(req: Request, res: Response, next: NextFunction) {
    try {
      const { fullName, mobileNumber, password } = req.body;

      if (!fullName || !mobileNumber || !password) {
        res.status(400).json({
          success: false,
          message: 'Full name, mobile number, and password are required.',
        });
        return;
      }

      const result = await AuthService.registerCitizen({
        fullName,
        mobileNumber,
        password,
      });

      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Citizen registration failed.',
      });
    }
  }

  /**
   * Citizen OTP verification: activates account and returns JWT session.
   * POST /api/auth/verify-mobile-otp
   */
  static async verifyMobileOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNumber, otp } = req.body;

      if (!mobileNumber || !otp) {
        res.status(400).json({
          success: false,
          message: 'Mobile number and 6-digit OTP code are required.',
        });
        return;
      }

      const result = await AuthService.verifyMobileOtp({
        mobileNumber,
        otp,
      });

      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'OTP verification failed.',
      });
    }
  }

  /**
   * Citizen OTP resend: enforces 30-60s cooldown and resets expiry.
   * POST /api/auth/resend-mobile-otp
   */
  static async resendMobileOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { mobileNumber } = req.body;

      if (!mobileNumber) {
        res.status(400).json({
          success: false,
          message: 'Mobile number is required to resend verification OTP.',
        });
        return;
      }

      const result = await AuthService.resendMobileOtp(mobileNumber);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to resend OTP.',
      });
    }
  }

  /**
   * Internal Admin/Employee standard registration.
   * POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role, departmentId } = req.body;
      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        return;
      }

      const result = await AuthService.register({ name, email, password, role, departmentId });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Unified login: supports Email or Mobile Number + Password.
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, mobileNumber, identifier } = req.body;
      const loginIdentifier = identifier || email || mobileNumber;

      if (!loginIdentifier || !password) {
        res.status(400).json({
          success: false,
          message: 'Email or mobile number, and password are required.',
        });
        return;
      }

      const result = await AuthService.login(loginIdentifier, password);
      res.json({ success: true, data: result });
    } catch (error: any) {
      if (error.code === 'ACCOUNT_UNVERIFIED') {
        res.status(403).json({
          success: false,
          message: error.message,
          code: 'ACCOUNT_UNVERIFIED',
          requiresOtp: true,
          mobileNumber: error.mobileNumber,
        });
        return;
      }
      res.status(401).json({ success: false, message: error.message });
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const profile = await AuthService.getProfile(req.user.id);
      res.json({ success: true, data: profile });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  static async logout(req: Request, res: Response) {
    res.json({ success: true, message: 'Logged out successfully.' });
  }
}
