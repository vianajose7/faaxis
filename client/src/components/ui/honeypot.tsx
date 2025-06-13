import React from 'react';
import { UseFormReturn } from 'react-hook-form';

/**
 * Honeypot field to prevent bot submissions
 * This component renders an input field that is hidden from users but visible to bots
 * If the field is filled, it indicates a bot submission
 */
export function Honeypot({ 
  className = '',
  name = 'honeypot',
  form
}: { 
  className?: string;
  name?: string;
  form?: UseFormReturn<any>;
}) {
  return (
    <div 
      aria-hidden="true"
      className={`${className} absolute overflow-hidden h-px w-px -m-px p-0 border-0`}
      style={{ clip: 'rect(1px, 1px, 1px, 1px)', clipPath: 'inset(50%)' }}
    >
      <label htmlFor={`${name}-field`} className="sr-only">
        Leave this field empty
      </label>
      <input
        tabIndex={-1}
        autoComplete="off"
        id={`${name}-field`}
        {...(form ? form.register(name) : { name })}
        type="text"
        className="h-0 w-0 opacity-0"
      />
    </div>
  );
}

/**
 * Higher-order function that validates if the form submission is from a bot
 * based on honeypot field value and timing.
 * 
 * @param handler The original form submission handler
 * @param minSubmitTime Minimum time in ms that should pass between form render and submission (default: 1000ms)
 * @returns A new handler that first validates against bot submissions
 */
export function withSpamProtection(
  handler: (event: React.FormEvent<HTMLFormElement>) => void,
  minSubmitTime = 1000
) {
  // Create a closure to store the form render time
  const renderTime = Date.now();
  
  return (event: React.FormEvent<HTMLFormElement>) => {
    // Check if enough time has passed since form render
    const timePassed = Date.now() - renderTime;
    
    // Get the honeypot field value
    const form = event.currentTarget;
    const honeypotValue = form.elements.namedItem('honeypot') as HTMLInputElement;
    
    // If the honeypot field is filled or the form was submitted too quickly, 
    // treat it as a bot submission
    if (honeypotValue?.value || timePassed < minSubmitTime) {
      // Prevent the default form submission
      event.preventDefault();
      
      // Optionally log the bot attempt but return without calling the handler
      console.log('Bot submission detected and blocked');
      return;
    }
    
    // If all checks pass, call the original handler
    handler(event);
  };
}