import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "wouter";
import { usePremium } from "@/hooks/use-premium";

export function PremiumCTA() {
  const { hasPremium } = usePremium();
  
  // If user is already premium, show a thank you message instead
  if (hasPremium) {
    return (
      <div className="rounded-lg mt-8 mb-4 bg-gradient-to-r from-green-500/70 via-green-400/60 to-primary/60">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-white">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <Check className="h-6 w-6 mr-2" /> 
              Premium Features Unlocked
            </h3>
            <p className="text-white/90 leading-relaxed">
              You have access to all premium features including detailed projections, 
              firm-specific payout grids, and all 25+ wealth management firms.
            </p>
          </div>
          
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white hover:bg-white/90 text-gray-800 py-3 px-6 rounded-md font-medium flex items-center whitespace-nowrap"
          >
            Return to Top
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
  
  // For non-premium users, don't show redundant CTA since there's already one above
  return null;
}