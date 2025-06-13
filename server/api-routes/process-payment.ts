import { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';

// Initialize Stripe with the secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required for payment processing');
}

// @ts-ignore - Stripe typings mismatch - using latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Process premium membership payments
 * Uses the fixed $299 price point for all premium purchases
 */
export async function processPaymentSimple(req: Request, res: Response) {
  try {
    const { card, calculatorData } = req.body;

    if (!card) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment information',
      });
    }

    // Fixed price for premium membership: $299
    const premiumPrice = 299;
    // Convert amount to cents for Stripe
    const amountInCents = Math.round(premiumPrice * 100);

    // Create a payment method using the card details
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc,
      },
      billing_details: {
        name: card.name,
        address: {
          postal_code: card.address_zip,
        },
      },
    });

    // Create a payment intent using the payment method
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method: paymentMethod.id,
      confirm: true,
      description: 'Premium Membership - FA Axis',
      statement_descriptor: 'FA AXIS PREMIUM',
      metadata: {
        // Store calculator data if available
        calculatorId: calculatorData?.calculatorId || '',
        calculatorResult: calculatorData?.result || '',
        userId: req.user?.id?.toString() || '',
        productType: 'premium_membership',
        purchaseDate: new Date().toISOString(),
        price: '299.00'
      },
      return_url: `${req.protocol}://${req.get('host')}/payment-success`,
    });

    // If the user is authenticated, update their membership status
    if (req.isAuthenticated() && req.user?.id) {
      try {
        // Update user's premium status in the database
        await storage.updateUserPremiumStatus(req.user.id, true);
        console.log(`Updated premium status for user ${req.user.id} after successful payment`);
      } catch (error) {
        console.error(`Failed to update premium status for user ${req.user.id}:`, error);
      }
    }

    // Return success response
    return res.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
    
  } catch (error: any) {
    console.error('Payment processing error:', error.message);
    
    // Return error response
    return res.status(400).json({
      success: false,
      error: error.message || 'Payment processing failed',
    });
  }
}