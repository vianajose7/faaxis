/**
 * Utility function to generate a checkout URL with calculator data
 * This function creates a URL with the calculator data as query parameters
 */
export function getCheckoutUrlWithCalculatorData(
  calculatorId?: string,
  result?: string
): string {
  const params = new URLSearchParams();
  
  if (calculatorId) {
    params.set('calculatorId', calculatorId);
  }
  
  if (result) {
    params.set('result', result);
  }
  
  // Store in sessionStorage as fallback
  const data = { calculatorId, result };
  sessionStorage.setItem('calculatorData', JSON.stringify(data));
  
  // Return URL with query parameters if they exist
  const queryString = params.toString();
  return queryString ? `/checkout?${queryString}` : '/checkout';
}

/**
 * Example usage:
 * 
 * // In a calculator component
 * import { getCheckoutUrlWithCalculatorData } from '@/utils/calculator-to-checkout';
 * 
 * // When user wants to purchase after seeing calculator results
 * const handlePurchase = () => {
 *   const checkoutUrl = getCheckoutUrlWithCalculatorData('practice-valuation', '$1,250,000');
 *   navigate(checkoutUrl); // Using wouter's navigate
 * };
 * 
 * // Or with Link component
 * <Link to={getCheckoutUrlWithCalculatorData('practice-valuation', '$1,250,000')}>
 *   Proceed to Checkout
 * </Link>
 */