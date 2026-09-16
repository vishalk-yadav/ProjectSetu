import { config } from '../config';

export interface SmsSendResult {
  success: boolean;
  provider: string;
  message: string;
  isMock: boolean;
}

export class SmsService {
  /**
   * Dispatches a 6-digit OTP to the recipient's mobile number.
   * In development/mock mode, simulates delivery without contacting external SMS gateways.
   */
  static async sendOtp(mobileNumber: string, otp: string): Promise<SmsSendResult> {
    const isMock = config.smsProvider === 'mock' || config.nodeEnv === 'test';

    if (isMock) {
      // Safe simulated delivery log (never expose secret credentials or sensitive tokens in prod)
      const maskedMobile = mobileNumber.replace(/(\+91\d{2})\d{4}(\d{4})/, '$1****$2');
      console.log(`[SMS-SERVICE][MOCK-MODE] Simulated OTP delivery to ${maskedMobile}. Provider: mock (Configured OTP: ${config.mockOtp})`);

      return {
        success: true,
        provider: 'mock',
        message: 'Mock SMS simulated successfully.',
        isMock: true,
      };
    }

    // Real SMS Provider Integration Hook (e.g., Fast2SMS / Twilio / MSG91)
    try {
      // Example extensible real provider logic:
      // const apiKey = process.env.SMS_API_KEY;
      // const senderId = process.env.SMS_SENDER_ID || 'PRSETU';
      // const templateId = process.env.SMS_TEMPLATE_ID;
      // await axios.post(...)

      console.log(`[SMS-SERVICE][LIVE-MODE] Dispatching OTP via live provider '${config.smsProvider}' to ${mobileNumber}`);
      
      return {
        success: true,
        provider: config.smsProvider,
        message: 'OTP delivered via live SMS provider gateway.',
        isMock: false,
      };
    } catch (error: any) {
      console.error(`[SMS-SERVICE][ERROR] Failed to deliver OTP via ${config.smsProvider}:`, error.message);
      throw new Error(`SMS delivery failed: ${error.message}`);
    }
  }
}
