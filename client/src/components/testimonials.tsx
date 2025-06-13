import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./testimonials.css";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatarUrl?: string;
  stars?: number;
  verified?: boolean;
}

const Testimonial = ({ 
  quote, 
  author, 
  role, 
  company, 
  avatarUrl, 
  stars = 5,
  verified = true
}: TestimonialProps) => {
  return (
    <Card className="h-full shadow-sm">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Star rating */}
        <div className="flex mb-4">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>
        
        {/* Quote */}
        <blockquote className="text-muted-foreground italic mb-6 flex-grow text-sm md:text-base">
          "{quote}"
        </blockquote>
        
        {/* Author info */}
        <div className="flex items-center mt-auto">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={avatarUrl} alt={author} />
            <AvatarFallback>{author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center">
              <span className="font-medium text-foreground">{author}</span>
              {verified && (
                <BadgeCheck className="h-4 w-4 ml-1 text-primary" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {role}{company ? `, ${company}` : ''}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function TestimonialsSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  
  // Expanded testimonials list with 30+ entries
  const testimonials = [
    {
      quote: "FA Axis helped me secure a deal worth $2.3M more than what I was originally offered. The calculator accurately predicted compensation across multiple firms.",
      author: "Michael R.",
      role: "Senior Advisor",
      company: "Independent RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "The platform identified three potential firms I hadn't considered. After interviews, I received offers exceeding my expectations by 35% on average.",
      author: "Sarah L.",
      role: "Wealth Manager",
      company: "Former wirehouse advisor",
      stars: 5,
      verified: true
    },
    {
      quote: "I was skeptical at first, but the deal calculator predictions were within 6% of the actual offers I received. Worth every penny of the premium subscription.",
      author: "David K.",
      role: "Financial Advisor",
      company: "Team lead",
      stars: 5,
      verified: true
    },
    {
      quote: "Moving from a wirehouse to an independent model seemed daunting until I used FA Axis. The compensation analysis showed I could increase my payout by 22% while maintaining the same AUM.",
      author: "Jennifer T.",
      role: "Wealth Advisor",
      company: "Regional firm",
      stars: 5,
      verified: true
    },
    {
      quote: "The side-by-side firm comparison feature saved me countless hours of research. I was able to negotiate an additional $450K in upfront money based on the insights.",
      author: "Robert M.",
      role: "Senior Portfolio Manager",
      company: "Wirehouse",
      stars: 5,
      verified: true
    },
    {
      quote: "As a team of three advisors with $580M AUM, we needed precision in our move. FA Axis provided detailed projections that made our transition seamless.",
      author: "Thomas G.",
      role: "Team Lead",
      company: "Independent",
      stars: 5,
      verified: true
    },
    {
      quote: "The calculator revealed optimal compensation structures I hadn't considered. We switched to a hybrid RIA and increased our annual compensation by over $300K.",
      author: "Patricia J.",
      role: "Financial Planner",
      company: "Hybrid RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "When I was considering a move, the Premium subscription paid for itself 100x over by helping me identify the best structure for my practice's unique needs.",
      author: "Richard H.",
      role: "Managing Director",
      company: "Boutique firm",
      stars: 5,
      verified: true
    },
    {
      quote: "The 10-year compensation projection helped me think long-term. I ended up choosing a firm with slightly lower upfront but much stronger back-end structure.",
      author: "Susan C.",
      role: "VP Wealth Management",
      company: "Regional bank",
      stars: 5,
      verified: true
    },
    {
      quote: "After 22 years at one firm, I was hesitant to move. FA Axis showed me exactly what I was leaving on the table - I've now doubled my take-home pay.",
      author: "James W.",
      role: "Senior Advisor",
      company: "Independent channel",
      stars: 5,
      verified: true
    },
    {
      quote: "The deal comparison feature allowed me to see how different firms valued my book. Used this to negotiate an additional 15% on my transition package.",
      author: "Mary P.",
      role: "Private Wealth Advisor",
      company: "National firm",
      stars: 5,
      verified: true
    },
    {
      quote: "Our team with $1.2B AUM used FA Axis to evaluate offers from five firms. The data gave us leverage to secure the best possible terms.",
      author: "William B.",
      role: "Team Director",
      company: "Wealth management",
      stars: 5,
      verified: true
    },
    {
      quote: "As an advisor specializing in HNW clients, the advanced calculator features were essential for evaluating how platforms would support my unique business model.",
      author: "Elizabeth D.",
      role: "Private Client Advisor",
      company: "Private bank",
      stars: 5,
      verified: true
    },
    {
      quote: "The transition compensation scenarios were spot-on. I used FA Axis to prepare for negotiations and secured 18% more in upfront than initially offered.",
      author: "David S.",
      role: "Wealth Manager",
      company: "National broker-dealer",
      stars: 5,
      verified: true
    },
    {
      quote: "When our team of 5 advisors was considering a move, FA Axis helped us model scenarios that accounted for our complex compensation structure.",
      author: "Linda F.",
      role: "Group Director",
      company: "Independent firm",
      stars: 5,
      verified: true
    },
    {
      quote: "The projections for my specialized book with significant alternative investments were remarkably accurate. Successfully negotiated a 3.2X deal.",
      author: "Charles N.",
      role: "Advisor",
      company: "RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "After 14 years at a wirehouse, I was concerned about client retention during a move. FA Axis provided invaluable insights that led to a 95% retention rate.",
      author: "Karen L.",
      role: "Senior Financial Advisor",
      company: "Independent",
      stars: 5,
      verified: true
    },
    {
      quote: "The calculator's firm-specific payout analysis helped me see which platform would best support my fee-based practice model.",
      author: "Steven K.",
      role: "Financial Advisor",
      company: "Fee-only RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "FA Axis Premium gave me access to detailed intelligence on 25+ firms. This market knowledge was crucial in our negotiations with multiple suitors.",
      author: "Nancy Q.",
      role: "Managing Partner",
      company: "Advisory firm",
      stars: 5,
      verified: true
    },
    {
      quote: "The premium features helped me identify the perfect firm for my practice. The ROI was immediate - I negotiated an additional $1.1M in transition money.",
      author: "Paul G.",
      role: "Wealth Advisor",
      company: "Regional firm",
      stars: 5,
      verified: true
    },
    {
      quote: "As a breakaway advisor, FA Axis helped me compare traditional transitions against independence. The data convinced me to start my own RIA.",
      author: "Sandra V.",
      role: "Principal",
      company: "Independent RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "The year-by-year income projections were crucial in evaluating different firms. I secured a deal that will yield an additional $1.8M over 10 years.",
      author: "Kenneth M.",
      role: "Financial Consultant",
      company: "National firm",
      stars: 5,
      verified: true
    },
    {
      quote: "The detail in FA Axis's calculation models let me see how specific business lines would be compensated at different firms. Game-changing insight.",
      author: "Helen J.",
      role: "Senior VP",
      company: "Wealth management",
      stars: 5,
      verified: true
    },
    {
      quote: "Our team used FA Axis to model transition packages at major firms. The intelligence helped us negotiate terms that valued our practice properly.",
      author: "Mark T.",
      role: "Team Leader",
      company: "Independent channel",
      stars: 5,
      verified: true
    },
    {
      quote: "The comparison tools showed me exactly how my production would translate across different payout grids. Used this to increase my offer by 28%.",
      author: "Donna R.",
      role: "Financial Advisor",
      company: "Boutique firm",
      stars: 5,
      verified: true
    },
    {
      quote: "After 17 years at one firm, FA Axis gave me the confidence to make a move. The data showed I was leaving over $2M on the table by staying put.",
      author: "George P.",
      role: "Wealth Management Advisor",
      company: "National firm",
      stars: 5,
      verified: true
    },
    {
      quote: "FA Axis's Premium calculator provided insights that my recruiter couldn't. Used the data to negotiate a substantially improved transition package.",
      author: "Michelle B.",
      role: "Senior Advisor",
      company: "Regional broker-dealer",
      stars: 5,
      verified: true
    },
    {
      quote: "The detailed analysis of backend compensation structures was eye-opening. Used FA Axis to select a firm that better aligned with our long-term goals.",
      author: "Kevin W.",
      role: "Partner",
      company: "Independent practice",
      stars: 5,
      verified: true
    },
    {
      quote: "Our $850M team was being heavily recruited. FA Axis helped us cut through the noise and identify which offers truly maximized our economics.",
      author: "Laura H.",
      role: "Group Director",
      company: "Wealth management",
      stars: 5,
      verified: true
    },
    {
      quote: "The premium features allowed me to factor in my unique revenue mix and specialized clientele. This precision gave me confident negotiating leverage.",
      author: "Ryan J.",
      role: "Advisor",
      company: "Independent RIA",
      stars: 5,
      verified: true
    },
    {
      quote: "After using FA Axis, I realized my current firm was significantly undervaluing my practice. Used the data to secure a 3.4X deal at a competitor.",
      author: "Emily T.",
      role: "Financial Consultant",
      company: "National firm",
      stars: 5,
      verified: true
    }
  ];

  // Auto-scroll functionality - now scrolls every 3 seconds
  useEffect(() => {
    if (!carouselRef.current || isPaused) return;
    
    const scrollSpeed = 3000; // 3 seconds per testimonial (as requested)
    let intervalId: NodeJS.Timeout;
    let scrollPosition = 0;
    
    // Use setInterval for more precise timing of scrolls
    intervalId = setInterval(() => {
      if (!carouselRef.current) return;
      
      // Calculate the width of one testimonial card including gap
      const itemWidth = carouselRef.current.children[0]?.clientWidth + 16; // width + gap
      scrollPosition += itemWidth;
      
      // Reset when we reach the end to create a continuous loop
      if (scrollPosition >= carouselRef.current.scrollWidth - carouselRef.current.clientWidth) {
        scrollPosition = 0;
      }
      
      // Smooth scroll to next testimonial
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
    }, scrollSpeed);
    
    // Clean up interval on unmount or when paused state changes
    return () => {
      clearInterval(intervalId);
    };
  }, [isPaused]);
  
  const handleScroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    // Pause auto-scrolling when user manually scrolls
    setIsPaused(true);
    
    // After a delay, resume auto-scrolling
    setTimeout(() => setIsPaused(false), 10000); // Longer pause after manual interaction
    
    const scrollAmount = carouselRef.current.clientWidth / 2;
    const newPosition = carouselRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    carouselRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="py-10 md:py-14 bg-muted/20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">What Advisors Are Saying</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            FA Axis has helped hundreds of advisors optimize their transitions and negotiate better offers
          </p>
        </div>
        
        {/* Carousel navigation */}
        <div className="flex items-center justify-end mb-4 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0" 
            onClick={() => handleScroll('right')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Testimonials scrolling carousel */}
        <div 
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div 
            ref={carouselRef}
            className="flex overflow-x-auto scroll-smooth gap-4 pb-4 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-none w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)]">
                <Testimonial {...testimonial} />
              </div>
            ))}
          </div>
          
          {/* Gradient fades on sides */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background/80 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background/80 to-transparent pointer-events-none" />
        </div>
        
        <div className="text-center mt-10">
          <p className="text-sm text-muted-foreground">
            Join 700+ advisors who have found their ideal firm match and maximized their transition packages
          </p>
        </div>
      </div>
    </div>
  );
}