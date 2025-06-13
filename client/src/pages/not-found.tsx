import { Button } from "@/components/ui/button";
import { ChevronLeft, TrendingDown, Wallet, PiggyBank, DollarSign, BarChart4, BriefcaseBusiness, ArrowDown, CircleDollarSign, CreditCard, LineChart, Coins, BadgeDollarSign, FileBarChart } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { useEffect, useState, useRef } from "react";

export default function NotFound() {
  const [stockPrice, setStockPrice] = useState(3500);
  const [showCrash, setShowCrash] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [hoverCount, setHoverCount] = useState(0);
  const [randomQuoteIndex, setRandomQuoteIndex] = useState(0);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const chartDataRef = useRef<{x: number, y: number}[]>([]);
  
  const financialQuotes = [
    "This asset has been delisted from our portfolio.",
    "Your 404 investment just crashed. Try diversifying to our homepage.",
    "The market for this page has completely dried up.",
    "Even Warren Buffett couldn't find value in this page.",
    "Our analysts recommend a strong SELL on this URL.",
    "This bear market in page availability is temporary.",
    "Time for a page reallocation strategy!"
  ];
  
  useEffect(() => {
    // Random quote selection
    setRandomQuoteIndex(Math.floor(Math.random() * financialQuotes.length));
    
    // Initial animation timing - faster animation
    const timer1 = setTimeout(() => setShowCrash(true), 750); // Reduced from 1500ms to 750ms
    const timer2 = setTimeout(() => setAnimationComplete(true), 3500); // Reduced from 8000ms to 3500ms
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);
  
  useEffect(() => {
    if (showCrash) {
      // Stock crash animation - start from 3500, end around 404
      let frameCount = 0;
      const maxFrames = 30; // Reduced from 70 to 30 for faster animation
      
      const interval = setInterval(() => {
        frameCount++;
        setStockPrice(prev => {
          // Calculate target - approaching 404 over time
          const percentComplete = Math.min(frameCount / maxFrames, 1);
          const target = 404;
          const range = 3500 - target;
          
          // Add some volatility to the crash
          const volatility = Math.random() * 80 * (1 - percentComplete);
          const newPrice = 3500 - (range * percentComplete) + volatility;
          
          // Add datapoint to chart - add fewer points for smoother chart
          if (frameCount % 2 === 0 && chartDataRef.current.length < 100) {
            chartDataRef.current.push({
              x: chartDataRef.current.length,
              y: newPrice
            });
            drawChart();
          }
          
          // Stop around 404
          if (frameCount >= maxFrames) {
            clearInterval(interval);
            return 404;
          }
          
          return newPrice;
        });
      }, 80); // Reduced from 200ms to 80ms for faster animation
      
      return () => clearInterval(interval);
    }
  }, [showCrash]);
  
  // Draw the chart
  const drawChart = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const data = chartDataRef.current;
    if (data.length < 2) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set chart styles
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
    
    // Calculate scaling factors
    const xFactor = canvas.width / (data.length - 1);
    const yMin = Math.min(...data.map(point => point.y));
    const yMax = Math.max(...data.map(point => point.y));
    const yRange = yMax - yMin;
    const yFactor = (canvas.height - 20) / yRange;
    
    // Start drawing
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - ((data[0].y - yMin) * yFactor) - 10);
    
    // Draw line segments
    for (let i = 1; i < data.length; i++) {
      const x = i * xFactor;
      const y = canvas.height - ((data[i].y - yMin) * yFactor) - 10;
      ctx.lineTo(x, y);
    }
    
    // Stroke the line
    ctx.stroke();
    
    // Add line fill
    const lastPoint = data[data.length - 1];
    const lastX = (data.length - 1) * xFactor;
    const lastY = canvas.height - ((lastPoint.y - yMin) * yFactor) - 10;
    
    ctx.lineTo(lastX, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    
    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
    ctx.fillStyle = gradient;
    ctx.fill();
  };
  
  const handleHover = () => {
    setHoverCount(prev => prev + 1);
    if (hoverCount > 2) {
      setShowRecovery(true);
    }
  };

  // Animation class mapping
  const getAnimationClass = (index: number) => {
    const classes = [
      "animate-float-1",
      "animate-float-2", 
      "animate-float-3", 
      "animate-float-4", 
      "animate-float-5"
    ];
    return classes[index % 5];
  };
  
  // Get icon by index
  const getIconByIndex = (index: number) => {
    const size = 18 + Math.floor(Math.random() * 14); // Size between 18-32px
    
    switch (index % 10) {
      case 0: return <DollarSign size={size} />;
      case 1: return <BarChart4 size={size} />;
      case 2: return <Wallet size={size} />;
      case 3: return <PiggyBank size={size} />;
      case 4: return <BriefcaseBusiness size={size} />;
      case 5: return <CircleDollarSign size={size} />;
      case 6: return <CreditCard size={size} />;
      case 7: return <LineChart size={size} />;
      case 8: return <Coins size={size} />;
      case 9: return <BadgeDollarSign size={size} />;
      default: return <FileBarChart size={size} />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>404 Market Crash | Financial Advisor Axis</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background/70 to-primary/10 p-4 overflow-hidden relative">
        {/* Floating financial icons background - increased to 60 icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {[...Array(60)].map((_, i) => (
            <div 
              key={i}
              className={`absolute text-primary/20 dark:text-primary/10 ${getAnimationClass(i)}`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                transform: `rotate(${Math.random() * 360}deg) scale(${0.5 + Math.random() * 1.5})`,
              }}
            >
              {getIconByIndex(i)}
            </div>
          ))}
        </div>

        <div className="w-full max-w-xl text-center bg-white/10 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-xl border border-primary/20 relative z-10">
          {/* Stock market crash chart */}
          <div className="mb-6">
            <div className="relative h-48 w-full rounded-lg overflow-hidden border border-gray-200/20 bg-gray-50/10 backdrop-blur-sm shadow-inner">
              <canvas 
                ref={chartCanvasRef} 
                width="500" 
                height="200" 
                className="absolute inset-0 w-full h-full"
              ></canvas>
              
              {/* Stock ticker overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div 
                  className={`text-6xl md:text-7xl font-bold transition-all duration-500 ${showCrash ? 'text-red-500' : 'text-green-600'}`}
                  style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
                >
                  {stockPrice.toFixed(0)}
                </div>
                
                <div className={`flex items-center gap-1 mt-2 ${showCrash ? 'text-red-500' : 'text-green-600'}`}>
                  <TrendingDown className={`h-5 w-5 ${showCrash ? 'animate-pulse' : ''}`} />
                  <span className="text-sm font-mono">PGNOTFND</span>
                </div>
              </div>
              
              {/* Chart axes and labels */}
              <div className="absolute bottom-2 right-3 text-xs text-gray-500">t</div>
              <div className="absolute top-2 left-3 text-xs text-gray-500">$</div>
            </div>
          </div>
          
          <h1 className="mb-3 text-3xl md:text-4xl font-extrabold tracking-tight relative overflow-hidden group">
            <span className="inline-block">
              MARKET CRASH: PAGE NOT FOUND
              {/* Text glitch effect */}
              <span className="absolute inset-0 bg-red-500/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"></span>
            </span>
          </h1>
          
          <div className="mb-4 text-muted-foreground">
            <p className="mb-2">
              Our financial algorithms couldn't locate this asset in our portfolio.
              <span className="inline-block mx-1 animate-spin">💸</span>
              It seems to have crashed harder than the 2008 market!
            </p>
          </div>
          
          <div className="mb-6 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg border border-primary/10 transition-all duration-300 hover:scale-105">
            <p className="text-primary/80 italic relative">
              <span className="absolute -left-2 top-0 text-2xl text-primary/50">"</span>
              {financialQuotes[randomQuoteIndex]}
              <span className="absolute -right-2 bottom-0 text-2xl text-primary/50">"</span>
            </p>
            <p className="text-xs text-right mt-2 text-gray-500">— Financial Advisor AI, {new Date().getFullYear()}</p>
          </div>
          
          {/* Recovery strategy section */}
          <div className={`mb-6 transition-all duration-1000 ${showRecovery ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/50">
              <h3 className="font-bold text-green-700 dark:text-green-400 flex items-center">
                <PiggyBank className="mr-2 h-5 w-5" /> Recovery Strategy Activated
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                Our advisors recommend immediately diversifying to more reliable pages!
              </p>
            </div>
          </div>
          
          <div className="flex justify-center px-4 sm:px-6">
            <Button 
              variant="default" 
              size="lg" 
              asChild 
              className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110 w-full max-w-xs"
            >
              <Link to="/" className="flex items-center justify-center gap-2 group">
                <svg 
                  className="h-5 w-5 group-hover:animate-bounce" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 16L14 9L10 13L4 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 11C22 15.9706 17.9706 20 13 20C8.02944 20 4 15.9706 4 11C4 6.02944 8.02944 2 13 2C17.9706 2 22 6.02944 22 11Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M13 12L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 16.5V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 13.5L20 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Bull Market (Home)</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-1 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          33% { transform: translateY(-45px) rotate(8deg) translateX(15px); }
          66% { transform: translateY(-20px) rotate(-5deg) translateX(-10px); }
          100% { transform: translateY(0) rotate(0deg) translateX(0); }
        }
        @keyframes float-2 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          25% { transform: translateY(-30px) rotate(-5deg) translateX(-20px); }
          75% { transform: translateY(-60px) rotate(10deg) translateX(5px); }
          100% { transform: translateY(0) rotate(0deg) translateX(0); }
        }
        @keyframes float-3 {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          20% { transform: translateY(-40px) rotate(5deg) translateX(10px); }
          40% { transform: translateY(-15px) rotate(-8deg) translateX(-15px); }
          60% { transform: translateY(-35px) rotate(0deg) translateX(20px); }
          80% { transform: translateY(-20px) rotate(10deg) translateX(-5px); }
          100% { transform: translateY(0) rotate(0deg) translateX(0); }
        }
        @keyframes float-4 {
          0% { transform: translateY(0) rotate(0deg) translateX(0) scale(1); }
          50% { transform: translateY(-50px) rotate(-12deg) translateX(-30px) scale(1.2); }
          100% { transform: translateY(0) rotate(0deg) translateX(0) scale(1); }
        }
        @keyframes float-5 {
          0% { transform: translateY(0) rotate(0deg) translateX(0) scale(1); }
          30% { transform: translateY(-25px) rotate(5deg) translateX(25px) scale(0.8); }
          60% { transform: translateY(-45px) rotate(15deg) translateX(-15px) scale(1.1); }
          100% { transform: translateY(0) rotate(0deg) translateX(0) scale(1); }
        }
        .animate-float-1 { animation: float-1 15s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 18s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 20s ease-in-out infinite; }
        .animate-float-4 { animation: float-4 25s ease-in-out infinite; }
        .animate-float-5 { animation: float-5 22s ease-in-out infinite; }
      `}} />
    </>
  );
}