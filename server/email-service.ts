// server/email-service.ts
import { logger } from './logger';

// Enhanced debugging for email transmission
interface EmailRecord {
  email: string;
  code: string;
  timestamp: Date;
  success: boolean;
}

// Keep track of recent admin OTP emails for debugging
const recentAdminCodes: EmailRecord[] = [];

// Send admin verification codes ONLY by email using MailerSend
export async function sendAdminVerificationCode(
  to: string,
  code: string,
  type: "PASSWORD_RESET" | "LOGIN_OTP" = "LOGIN_OTP"
) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const from = "auth@faaxis.com"; // Verified sender domain
  
  if (!apiKey) throw new Error("MailerSend env vars missing");
  
  const subject = 
    type === "PASSWORD_RESET"
    ? "Reset your FA Axis admin password"
    : "Your FA Axis admin login code";
  
  const html = `
<p>Your verification code is:</p>
<h2 style="font-family:Inter,Arial,sans-serif;letter-spacing:2px">${code}</h2>
<p>This code expires in 15 minutes.</p>`;
  
  try {
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: { email: from, name: "FA Axis" },
        to: [{ email: to }],
        subject,
        html
      })
    });
    
    if (!res.ok) {
      const msg = await res.text();
      logger.error(`MailerSend delivery failed: ${res.status}, ${msg}`);
      
      // Store failed attempt for debugging with masked code
      const maskedCode = code.substring(0, 1) + '****' + code.substring(5);
      recentAdminCodes.push({
        email: to,
        code: maskedCode,
        timestamp: new Date(),
        success: false
      });
      
      throw new Error(`MailerSend delivery failed: ${res.status}`);
    }
  } catch (error) {
    logger.error("MailerSend email delivery failed:", error);
    
    // Store failed attempt for debugging with masked code
    const maskedCode = code.substring(0, 1) + '****' + code.substring(5);
    recentAdminCodes.push({
      email: to,
      code: maskedCode,
      timestamp: new Date(),
      success: false
    });
    
    throw new Error("Email delivery failed - please try again later");
  }
  
  // Log minimal information for audit purposes only
  logger.info(`[EMAIL SERVICE] Admin verification email sent to: ${to.substring(0, 3)}***@***${to.split('@')[1]}`);
  logger.info(`[EMAIL SERVICE] Type: ${type}`);
  logger.info(`[EMAIL SERVICE] Timestamp: ${new Date().toISOString()}`);
  
  // Store record for debugging without exposing the verification code
  // Use a masked version for security
  const maskedCode = code.substring(0, 1) + '****' + code.substring(5);
  recentAdminCodes.push({
    email: to,
    code: maskedCode, // Store masked code instead of actual code
    timestamp: new Date(),
    success: true
  });
  
  // Keep only the last 10 records
  if (recentAdminCodes.length > 10) {
    recentAdminCodes.shift();
  }
  
  return true;
}

// This function has been disabled for security - verification codes must only be delivered via email
export function getLatestAdminCode(email: string): string | null {
  // Function disabled - verification codes should only be accessible via email
  logger.warn(`[SECURITY] Attempt to retrieve admin code for ${email} was blocked - verification codes must only be delivered via email`);
  return null;
}

// Regular email sending function using MailerSend
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const from = "auth@faaxis.com"; // Verified sender domain
    
    if (!apiKey) {
      logger.error("[EMAIL SERVICE] Cannot send email - MailerSend API key missing");
      return false;
    }
    
    logger.info(`[EMAIL SERVICE] Sending email to ${to.substring(0, 3)}***@***${to.split('@')[1]}`);
    logger.info(`[EMAIL SERVICE] Subject: ${subject}`);
    
    const res = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: { email: from, name: "FA Axis" },
        to: [{ email: to }],
        subject,
        html: body
      })
    });
    
    if (!res.ok) {
      const msg = await res.text();
      logger.error(`[EMAIL SERVICE] MailerSend failed with status ${res.status}:`, msg);
      return false;
    }
    
    return true;
  } catch (error) {
    logger.error(`[EMAIL SERVICE] Failed to send email:`, error);
    return false;
  }
}

// Additional email functions required by other parts of the application
export async function sendListingApprovalNotification(to: string, listingId: string): Promise<boolean> {
  return sendEmail(
    to,
    "Your listing has been approved",
    `Your listing (ID: ${listingId}) has been approved and is now live on our platform.`
  );
}

export async function sendMarketplaceUpdatesNotification(to: string, updates: string): Promise<boolean> {
  return sendEmail(
    to,
    "Marketplace Updates Available",
    `Check out the latest updates on our marketplace: ${updates}`
  );
}

export async function sendVerificationEmail(to: string, verificationLink: string): Promise<boolean> {
  return sendEmail(
    to,
    "Verify Your Email Address",
    `Please verify your email address by clicking this link: ${verificationLink}`
  );
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
  const resetLink = `${process.env.APP_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  return sendEmail(
    to,
    "Reset Your Password",
    `You requested a password reset. Click this link to reset your password: ${resetLink}`
  );
}