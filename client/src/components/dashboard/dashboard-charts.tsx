import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/hooks/use-theme";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Type for comparison data
export interface ComparisonData {
  year: number;
  morganStanley: number;
  merrillLynch: number;
  ubsWealth: number;
  ameriprise: number;
  rayJames: number;
  lpl: number;
  finet?: number; // Optional for demo
  independent?: number; // Optional for demo
}

// Fixed color palette for firms to ensure consistency
export const firmColors = {
  morganStanley: "#4e85c5",
  merrillLynch: "#0073cf",
  ubsWealth: "#bb1e10",
  ameriprise: "#1f7442",
  rayJames: "#2874bb",
  lpl: "#823ea3",
  finet: "#f39c12",
  independent: "#2c3e50"
};

// Format firm name for display
export const formatFirmName = (firm: string): string => {
  switch (firm) {
    case 'morganStanley': return 'Morgan Stanley';
    case 'merrillLynch': return 'Merrill Lynch';
    case 'ubsWealth': return 'UBS';
    case 'rayJames': return 'Raymond James';
    case 'ameriprise': return 'Ameriprise';
    case 'lpl': return 'LPL';
    case 'finet': return 'Fidelity';
    case 'independent': return 'Independent';
    default: return firm;
  }
};

// Format currency for display
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Comparison chart component
export function ComparisonChart({ data }: { data: ComparisonData[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#333' : '#eee';
  const textColor = isDark ? '#ddd' : '#333';
  
  const firms = [
    'lpl',
    'ameriprise',
    'rayJames',
    'morganStanley',
    'ubsWealth',
    'merrillLynch'
  ];
  
  const hasIndependent = data.some(d => d.independent !== undefined);
  const hasFinet = data.some(d => d.finet !== undefined);
  
  if (hasFinet) firms.push('finet');
  if (hasIndependent) firms.push('independent');

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="year" 
            tick={{ fill: textColor }} 
            tickLine={{ stroke: textColor }}
            axisLine={{ stroke: textColor }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value / 1000}k`}
            tick={{ fill: textColor }} 
            tickLine={{ stroke: textColor }}
            axisLine={{ stroke: textColor }}
          />
          <Tooltip
            formatter={(value) => [`${formatCurrency(value as number)}`, 'Annual Compensation']}
            labelFormatter={(value) => `Year ${value}`}
          />
          <Legend formatter={(value) => formatFirmName(value)} />
          
          {firms.map((firm, index) => (
            <Bar
              key={firm}
              dataKey={firm}
              stackId="firm"
              fill={firmColors[firm as keyof typeof firmColors]}
              animationDuration={1500 + index * 200}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Recruiting value chart component
export function RecruitingValueChart({ data }: { data: ComparisonData[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridColor = isDark ? '#333' : '#eee';
  const textColor = isDark ? '#ddd' : '#333';
  
  // Calculate the total value trend over time (using LPL as example)
  const totalValueData = data.map((item, index) => {
    const year = item.year;
    const previousTotal = index > 0 
      ? data.slice(0, index).reduce((sum, y) => sum + (y.lpl || 0), 0) 
      : 0;
    
    return {
      year,
      cumulativeValue: previousTotal + (item.lpl || 0),
      annualValue: item.lpl || 0
    };
  });

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={totalValueData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="year" 
            tick={{ fill: textColor }} 
            tickLine={{ stroke: textColor }}
            axisLine={{ stroke: textColor }}
          />
          <YAxis 
            tickFormatter={(value) => `$${value / 1000000}M`}
            tick={{ fill: textColor }} 
            tickLine={{ stroke: textColor }}
            axisLine={{ stroke: textColor }}
          />
          <Tooltip
            formatter={(value) => [`${formatCurrency(value as number)}`, 'Value']}
            labelFormatter={(value) => `Year ${value}`}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="cumulativeValue" 
            name="Cumulative Compensation" 
            stroke="#8884d8" 
            fill="url(#colorUv)" 
            animationDuration={2000}
          />
          <Area 
            type="monotone" 
            dataKey="annualValue" 
            name="Annual Compensation" 
            stroke="#82ca9d" 
            fill="url(#colorPv)" 
            animationDuration={1800}
          />
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Metric card component
interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  change?: number;
  isUp?: boolean;
  formatter: (value: number) => string;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  change,
  isUp,
  formatter
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h2 className="text-3xl font-bold">{formatter(value)}</h2>
            
            {change && (
              <div className="flex items-center mt-1">
                <span className={`text-xs font-medium ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                  {isUp ? '↑' : '↓'} {formatter(change)}
                </span>
              </div>
            )}
          </div>
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">{description}</p>
      </CardContent>
    </Card>
  );
}