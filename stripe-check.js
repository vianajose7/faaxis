/**
 * Stripe Configuration Check
 * 
 * This script helps verify that your Stripe configuration is correct.
 * You can run this before deploying to production to ensure payments will work.
 */

// Check for Stripe environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublicKey = process.env.VITE_STRIPE_PUBLIC_KEY;

console.log('Stripe Configuration Check:');
console.log('--------------------------');

let configOK = true;

if (!stripeSecretKey) {
  console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
  configOK = false;
} else {
  console.log('✅ STRIPE_SECRET_KEY is set');
  console.log(`   Mode: ${stripeSecretKey.startsWith('sk_test_') ? 'TEST' : 'LIVE'}`);
}

if (!stripePublicKey) {
  console.error('❌ VITE_STRIPE_PUBLIC_KEY is missing from environment variables');
  configOK = false;
} else {
  console.log('✅ VITE_STRIPE_PUBLIC_KEY is set');
  console.log(`   Mode: ${stripePublicKey.startsWith('pk_test_') ? 'TEST' : 'LIVE'}`);
}

// Check for mode consistency
if (stripeSecretKey && stripePublicKey) {
  const secretIsTest = stripeSecretKey.startsWith('sk_test_');
  const publicIsTest = stripePublicKey.startsWith('pk_test_');
  
  if (secretIsTest !== publicIsTest) {
    console.error('❌ Mode mismatch: Secret key and public key are in different modes (test/live)');
    configOK = false;
  } else {
    console.log('✅ Mode consistency: Both keys are in the same mode');
  }
}

console.log('--------------------------');
console.log(`Overall: ${configOK ? '✅ Configuration OK' : '❌ Configuration has issues'}`);

if (!configOK) {
  console.log('\nTo fix Stripe configuration issues:');
  console.log('1. Make sure both STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY are set');
  console.log('2. Ensure both keys are in the same mode (both test or both live)');
  console.log('3. If using the unified server approach, ensure environment variables are properly passed');
}

export default configOK;