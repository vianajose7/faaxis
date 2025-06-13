import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ArrowUp, DollarSign, LineChart, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import CountUp from 'react-countup';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  description: string;
  isAnimated?: boolean;
}

const KpiCard = ({ 
  icon, 
  title, 
  value, 
  prefix = '', 
  suffix = '', 
  description,
  isAnimated = true 
}: KpiCardProps) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.]/g, ''));
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="bg-primary/10 p-2 rounded-full">
            {icon}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mt-4 text-foreground">{title}</h3>
        
        <div className="mt-2 mb-2">
          <span className="text-2xl md:text-3xl font-bold">
            {prefix}
            {isAnimated && !isNaN(numericValue) ? (
              <span ref={el => {
                if (el) {
                  try {
                    // Use vanilla JS approach for animated counting
                    const duration = 2500; // 2.5 seconds
                    const interval = 30; // Update every 30ms
                    let currentValue = 0;
                    const targetValue = numericValue;
                    const steps = duration / interval;
                    const increment = targetValue / steps;
                    const decimals = numericValue % 1 !== 0 ? 1 : 0;
                    
                    // Start with zero
                    el.textContent = currentValue.toLocaleString(undefined, {
                      minimumFractionDigits: decimals,
                      maximumFractionDigits: decimals
                    }) + (suffix || '');
                    
                    // Animate the counter
                    const counter = setInterval(() => {
                      currentValue += increment;
                      if (currentValue >= targetValue) {
                        currentValue = targetValue;
                        clearInterval(counter);
                      }
                      
                      el.textContent = currentValue.toLocaleString(undefined, {
                        minimumFractionDigits: decimals,
                        maximumFractionDigits: decimals
                      }) + (suffix || '');
                    }, interval);
                  } catch (err) {
                    console.error('CountUp error:', err);
                    // Fallback to static display
                    el.textContent = `${numericValue}${suffix}`;
                  }
                }
              }}>{numericValue}{suffix}</span>
            ) : (
              <>
                {value}{suffix}
              </>
            )}
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export function SocialProofKPISection() {
  return (
    <div className="py-14 bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Optimize Your Value</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            FA Axis provides financial advisors with data-driven insights to maximize their transition packages
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KpiCard 
            icon={<DollarSign className="h-6 w-6 text-primary" />}
            title="Average Compensation Lift"
            value={27.9}
            suffix="%"
            description="Increase in total compensation for advisors using our platform"
          />
          
          <KpiCard 
            icon={<LineChart className="h-6 w-6 text-primary" />}
            title="Assets Analyzed"
            value={17}
            prefix="$"
            suffix="B+"
            description="Total AUM analyzed through our proprietary deal calculator"
          />
          
          <KpiCard 
            icon={<Users className="h-6 w-6 text-primary" />}
            title="Advisor Success Rate"
            value={99}
            suffix="%"
            description="Advisors who secured better terms using our insights"
          />
        </div>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="bg-white/40 inline-block p-2 rounded-full mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Get Your Custom Financial Blueprint</h3>
              <p className="text-muted-foreground max-w-xl">
                Our Premium Analysis provides a detailed comparison across 25+ firms with personalized projections 
                and negotiation strategies tailored to your specific practice model.
              </p>
            </div>
            
            <Link href="/checkout">
              <button className="bg-primary hover:bg-primary/90 text-white py-3 px-6 rounded-md font-medium flex items-center whitespace-nowrap">
                Upgrade to Premium
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}