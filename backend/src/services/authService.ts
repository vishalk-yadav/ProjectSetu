import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { UserRole } from '../types';
import { SmsService } from './smsService';

export interface CitizenRegisterInput {
  fullName: string;
  mobileNumber: string;
  password: string;
}

export interface VerifyOtpInput {
  mobileNumber: string;
  otp: string;
}

export class AuthService {
  /**
   * Normalizes an Indian mobile number into standard +91XXXXXXXXXX format.
   * Accepts: "9876543210", "+919876543210", "+91 98765 43210", "09876543210"
   */
  static normalizeIndianMobile(raw: string): string {
    if (!raw || typeof raw !== 'string') {
      throw new Error('Mobile number is required.');
    }

    // Remove all non-digit characters except leading plus
    let clean = raw.trim().replace(/[\s\-()]/g, '');

    if (clean.startsWith('+91')) {
      clean = clean.substring(3);
    } else if (clean.startsWith('91') && clean.length === 12) {
      clean = clean.substring(2);
    } else if (clean.startsWith('0') && clean.length === 11) {
      clean = clean.substring(1);
    }

    // Must be exactly 10 digits starting with 6, 7, 8, or 9
    const indianMobileRegex = /^[6-9]\d{9}$/;
    if (!indianMobileRegex.test(clean)) {
      throw new Error('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
    }

    return `+91${clean}`;
  }

  /**
   * Validates password strength:
   * At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.
   */
  static validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one number.');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character.');
    }
  }

  /**
   * Generates a 6-digit OTP code (or mock OTP in dev/mock mode).
   */
  static generateOtp(): string {
    if (config.smsProvider === 'mock' || config.nodeEnv === 'test') {
      return config.mockOtp || '123456';
    }
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Registers a citizen with Mobile Number + Password + OTP dispatch.
   */
  static async registerCitizen(data: CitizenRegisterInput) {
    const { fullName, mobileNumber, password } = data;

    if (!fullName || fullName.trim().length < 2) {
      throw new Error('Full name is required (minimum 2 characters).');
    }

    const normalizedMobile = this.normalizeIndianMobile(mobileNumber);
    this.validatePasswordStrength(password);

    // Check if mobile number is already registered
    const existingUser = await prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (existingUser) {
      if (existingUser.mobileVerified) {
        throw new Error('This mobile number is already registered and verified. Please log in.');
      }
      // If unverified, check resend cooldown before re-sending
      if (existingUser.lastOtpSentAt) {
        const elapsedSeconds = Math.floor((Date.now() - existingUser.lastOtpSentAt.getTime()) / 1000);
        if (elapsedSeconds < config.otpCooldownSeconds) {
          const waitTime = config.otpCooldownSeconds - elapsedSeconds;
          throw new Error(`An OTP was recently sent. Please wait ${waitTime} seconds before trying again.`);
        }
      }
    }

    // Generate secure OTP & hash it before storing
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpExpiry = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

    let user;
    if (existingUser) {
      // Update pending registration
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: fullName.trim(),
          password: hashedPassword,
          mobileVerificationOtpHash: otpHash,
          mobileVerificationOtpExpiry: otpExpiry,
          mobileVerificationAttempts: 0,
          lastOtpSentAt: new Date(),
          accountStatus: 'PENDING_VERIFICATION',
          mobileVerified: false,
          role: 'CITIZEN',
        },
      });
    } else {
      // Create new pending citizen record
      user = await prisma.user.create({
        data: {
          name: fullName.trim(),
          mobileNumber: normalizedMobile,
          password: hashedPassword,
          role: 'CITIZEN',
          isActive: true,
          mobileVerified: false,
          accountStatus: 'PENDING_VERIFICATION',
          mobileVerificationOtpHash: otpHash,
          mobileVerificationOtpExpiry: otpExpiry,
          mobileVerificationAttempts: 0,
          lastOtpSentAt: new Date(),
        },
      });
    }

    // Dispatch OTP via SMS service abstraction
    await SmsService.sendOtp(normalizedMobile, otp);

    const isMock = config.smsProvider === 'mock' || config.nodeEnv === 'test';

    return {
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedMobile}.`,
      mobileNumber: normalizedMobile,
      isMock,
      mockOtp: isMock ? config.mockOtp : undefined,
      cooldownSeconds: config.otpCooldownSeconds,
      expiresInMinutes: config.otpExpiryMinutes,
    };
  }

  /**
   * Verifies the 6-digit OTP and activates the citizen account.
   */
  static async verifyMobileOtp(data: VerifyOtpInput) {
    const { mobileNumber, otp } = data;

    const normalizedMobile = this.normalizeIndianMobile(mobileNumber);

    if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
      throw new Error('Please enter a valid 6-digit OTP verification code.');
    }

    const cleanOtp = otp.trim();

    const user = await prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
      include: {
        department: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) {
      throw new Error('No registration record found for this mobile number. Please register first.');
    }

    if (user.mobileVerified && user.accountStatus === 'ACTIVE') {
      throw new Error('This mobile number is already verified. Please proceed to login.');
    }

    // Check maximum attempts
    if (user.mobileVerificationAttempts >= config.otpMaxAttempts) {
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // Check expiry
    if (!user.mobileVerificationOtpExpiry || new Date() > user.mobileVerificationOtpExpiry) {
      throw new Error('Verification OTP has expired. Please request a new OTP.');
    }

    if (!user.mobileVerificationOtpHash) {
      throw new Error('No active OTP found. Please request a new verification code.');
    }

    // Compare submitted OTP against stored bcrypt hash
    const isValid = await bcrypt.compare(cleanOtp, user.mobileVerificationOtpHash);

    if (!isValid) {
      const newAttempts = user.mobileVerificationAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { mobileVerificationAttempts: newAttempts },
      });

      const remaining = config.otpMaxAttempts - newAttempts;
      if (remaining > 0) {
        throw new Error(`Invalid OTP. You have ${remaining} attempt(s) remaining.`);
      } else {
        throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
      }
    }

    // Verification successful -> activate citizen account and invalidate OTP
    const activatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        mobileVerified: true,
        accountStatus: 'ACTIVE',
        isActive: true,
        verifiedAt: new Date(),
        mobileVerificationOtpHash: null,
        mobileVerificationOtpExpiry: null,
        mobileVerificationAttempts: 0,
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        mobileVerified: true,
        accountStatus: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        createdAt: true,
      },
    });

    // Create session JWT token
    const token = jwt.sign(
      {
        id: activatedUser.id,
        email: activatedUser.email,
        mobileNumber: activatedUser.mobileNumber,
        role: activatedUser.role,
        departmentId: activatedUser.departmentId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return {
      success: true,
      message: 'Mobile number verified successfully. Welcome to ProjectSetu!',
      user: activatedUser,
      token,
    };
  }

  /**
   * Resends a fresh OTP to the citizen's mobile number, respecting cooldown and attempt limits.
   */
  static async resendMobileOtp(mobileNumber: string) {
    const normalizedMobile = this.normalizeIndianMobile(mobileNumber);

    const user = await prisma.user.findUnique({
      where: { mobileNumber: normalizedMobile },
    });

    if (!user) {
      throw new Error('No registration record found for this mobile number.');
    }

    if (user.mobileVerified) {
      throw new Error('This mobile number is already verified. Please log in.');
    }

    // Enforce cooldown (30-60s)
    if (user.lastOtpSentAt) {
      const elapsedSeconds = Math.floor((Date.now() - user.lastOtpSentAt.getTime()) / 1000);
      if (elapsedSeconds < config.otpCooldownSeconds) {
        const waitTime = config.otpCooldownSeconds - elapsedSeconds;
        throw new Error(`Please wait ${waitTime} second(s) before requesting another OTP.`);
      }
    }

    // Generate new OTP, hash it, and reset attempts
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + config.otpExpiryMinutes * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mobileVerificationOtpHash: otpHash,
        mobileVerificationOtpExpiry: otpExpiry,
        mobileVerificationAttempts: 0,
        lastOtpSentAt: new Date(),
      },
    });

    await SmsService.sendOtp(normalizedMobile, otp);

    const isMock = config.smsProvider === 'mock' || config.nodeEnv === 'test';

    return {
      success: true,
      message: `A new verification code has been sent to ${normalizedMobile}.`,
      mobileNumber: normalizedMobile,
      isMock,
      mockOtp: isMock ? config.mockOtp : undefined,
      cooldownSeconds: config.otpCooldownSeconds,
      expiresInMinutes: config.otpExpiryMinutes,
    };
  }

  /**
   * Standard registration for internal administrative personnel.
   */
  static async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    departmentId?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('A user with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        role: data.role || 'CITIZEN',
        departmentId: data.departmentId || null,
        mobileVerified: true,
        accountStatus: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        createdAt: true,
      },
    });

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        departmentId: user.departmentId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    return { user, token };
  }

  /**
   * Authenticates users via either Email OR Mobile Number + Password.
   * Ensures unverified citizens must complete OTP verification before session issue.
   */
  static async login(identifier: string, pass: string) {
    if (!identifier || !pass) {
      throw new Error('Email or mobile number, and password are required.');
    }

    const cleanIdentifier = identifier.trim();

    // Check if identifier looks like a mobile number
    let normalizedMobile: string | null = null;
    try {
      normalizedMobile = this.normalizeIndianMobile(cleanIdentifier);
    } catch {
      normalizedMobile = null;
    }

    let user = null;
    if (normalizedMobile) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { mobileNumber: normalizedMobile },
            { email: cleanIdentifier.toLowerCase() },
          ],
        },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { email: cleanIdentifier.toLowerCase() },
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      });
    }

    if (!user) {
      throw new Error('Invalid email, mobile number, or password.');
    }

    // For citizens with unverified mobile numbers, prompt verification
    if (user.role === 'CITIZEN' && !user.mobileVerified && user.mobileNumber) {
      const error: any = new Error('Account unverified. Please complete mobile OTP verification to activate your citizen account.');
      error.statusCode = 403;
      error.code = 'ACCOUNT_UNVERIFIED';
      error.mobileNumber = user.mobileNumber;
      throw error;
    }

    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) {
      throw new Error('Invalid email, mobile number, or password.');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        departmentId: user.departmentId,
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    const { password, mobileVerificationOtpHash, ...userWithoutSecrets } = user;
    return { user: userWithoutSecrets, token };
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        mobileNumber: true,
        role: true,
        mobileVerified: true,
        accountStatus: true,
        departmentId: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found.');
    }

    return user;
  }
}
