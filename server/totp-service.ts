import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

/**
 * Generate a new TOTP secret for a user
 * @param username Username or identifier for the user
 * @param issuer Name of the issuer (e.g., "FA Axis Admin")
 * @returns Object containing secret, otpauth URL, and QR code data URL
 */
export async function generateTOTPSecret(username: string, issuer: string = "FA Axis Admin"): Promise<{
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}> {
  // Create a new secret
  const secret = speakeasy.generateSecret({
    length: 20,
    name: encodeURIComponent(`${issuer}:${username}`),
    issuer: encodeURIComponent(issuer)
  });

  // Generate QR code as data URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

  return {
    secret: secret.base32, // This is what will be stored in the database
    otpauthUrl: secret.otpauth_url || '',
    qrCodeUrl: qrCodeUrl
  };
}

/**
 * Verify a TOTP token against a user's secret
 * @param token Token provided by the user (from their authenticator app)
 * @param secret The user's stored TOTP secret
 * @returns Boolean indicating if the token is valid
 */
export function verifyTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow a small window for time drift (1 step before/after)
  });
}

/**
 * Generate a current TOTP token (for testing)
 * @param secret The secret to generate the token from
 * @returns The current token
 */
export function generateCurrentToken(secret: string): string {
  return speakeasy.totp({
    secret: secret,
    encoding: 'base32'
  });
}