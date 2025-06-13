import { format } from 'date-fns';

// Function to generate date strings for news items
function getDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return format(date, 'yyyy-MM-dd');
}

export interface NewsItem {
  title: string;
  excerpt: string;
  date: string;
  source: string;
  sourceUrl: string;
  imageUrl?: string;
  category: 'move' | 'firm' | 'industry';
}

// Map of firm IDs to news items
export const firmNewsData: Record<string, NewsItem[]> = {
  // Morgan Stanley news
  "1": [
    {
      title: "$5B Morgan Stanley Team Jumps to UBS in California",
      excerpt: "A Morgan Stanley team that oversaw $5 billion in client assets has left to join rival UBS in California, according to sources familiar with the move.",
      date: getDate(3),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      imageUrl: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&q=80&w=3387&ixlib=rb-4.0.3",
      category: "move"
    },
    {
      title: "Morgan Stanley Wealth Management Reports Record Revenue in Q1",
      excerpt: "Morgan Stanley's wealth management division reported record revenue of $6.9 billion in the first quarter, up 8% from a year ago, as client assets hit a new high.",
      date: getDate(10),
      source: "InvestmentNews",
      sourceUrl: "https://www.investmentnews.com/",
      category: "firm"
    },
    {
      title: "Morgan Stanley Advisor Recognized in Barron's Top 100",
      excerpt: "Jane Smith, a wealth management advisor at Morgan Stanley's New York office, has been named to Barron's Top 100 Women Financial Advisors list for the fifth consecutive year.",
      date: getDate(15),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      category: "firm"
    },
    {
      title: "Morgan Stanley Enhances Advisor Technology Platform",
      excerpt: "Morgan Stanley has announced a significant upgrade to its advisor technology platform, introducing new AI-powered planning tools and enhanced client reporting capabilities.",
      date: getDate(7),
      source: "Financial Planning",
      sourceUrl: "https://www.financial-planning.com/",
      imageUrl: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80&w=3378&ixlib=rb-4.0.3",
      category: "firm"
    },
    {
      title: "Morgan Stanley Hires $800M Team from Merrill Lynch",
      excerpt: "Morgan Stanley has recruited a Merrill Lynch team that managed approximately $800 million in client assets in the Chicago area, according to individuals familiar with the move.",
      date: getDate(5),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
    {
      title: "Morgan Stanley Boosts Recruitment Deal Terms in Competitive Market",
      excerpt: "Morgan Stanley has reportedly enhanced its recruiting package for top-producing advisors, offering up to 360% of trailing 12-month production for teams managing over $1 billion.",
      date: getDate(12),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      category: "industry"
    },
  ],
  
  // UBS news
  "2": [
    {
      title: "UBS Completes Credit Suisse Integration for US Wealth Management",
      excerpt: "UBS has completed the integration of Credit Suisse's U.S. wealth management business, bringing over approximately 75% of advisors and $100 billion in client assets.",
      date: getDate(2),
      source: "Wall Street Journal",
      sourceUrl: "https://www.wsj.com/",
      imageUrl: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&q=80&w=3387&ixlib=rb-4.0.3",
      category: "firm"
    },
    {
      title: "UBS Loses $1.2B Team to First Republic Private Wealth",
      excerpt: "A team of UBS advisors overseeing approximately $1.2 billion in client assets has departed to join First Republic Private Wealth Management in San Francisco.",
      date: getDate(8),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
    {
      title: "UBS Wealth Management Americas Reports Strong Net New Assets",
      excerpt: "UBS Wealth Management Americas recorded $23 billion in net new assets for Q1 2025, representing the division's strongest quarter for asset gathering since the Credit Suisse acquisition.",
      date: getDate(14),
      source: "InvestmentNews",
      sourceUrl: "https://www.investmentnews.com/",
      category: "firm"
    },
    {
      title: "UBS Advisor Breaks Away to Launch Independent RIA",
      excerpt: "A veteran UBS advisor managing over $500 million in client assets has left the wirehouse to establish an independent RIA with Dynasty Financial Partners.",
      date: getDate(1),
      source: "RIABiz",
      sourceUrl: "https://riabiz.com/",
      category: "move"
    },
    {
      title: "UBS Launches New Alternative Investments Platform for HNW Clients",
      excerpt: "UBS has unveiled a new alternative investments platform providing high-net-worth clients with access to private equity, hedge funds, and private credit investments with lower minimums.",
      date: getDate(6),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      imageUrl: "https://images.unsplash.com/photo-1642543348745-5caa5847574b?auto=format&fit=crop&q=80&w=3387&ixlib=rb-4.0.3",
      category: "firm"
    },
    {
      title: "UBS Recruits Morgan Stanley Team Managing $1.5B",
      excerpt: "UBS has recruited a Morgan Stanley team based in Boston that managed approximately $1.5 billion in client assets, according to a person familiar with the move.",
      date: getDate(9),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
  ],
  
  // Raymond James news
  "3": [
    {
      title: "Raymond James Attracts $450M Team from Merrill Lynch",
      excerpt: "Raymond James has recruited a Merrill Lynch team managing approximately $450 million in client assets to join its employee channel in Denver, Colorado.",
      date: getDate(4),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
    {
      title: "Raymond James Expands West Coast Presence with New Office",
      excerpt: "Raymond James has opened a new flagship office in San Diego as part of its strategic West Coast expansion, which will house both employee and independent advisors.",
      date: getDate(11),
      source: "Financial Planning",
      sourceUrl: "https://www.financial-planning.com/",
      imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3",
      category: "firm"
    },
    {
      title: "Raymond James Reports Record Quarterly Net Revenues",
      excerpt: "Raymond James Financial reported record quarterly net revenues of $3.2 billion for Q1 fiscal 2025, up 12% compared to the same quarter last year.",
      date: getDate(7),
      source: "InvestmentNews",
      sourceUrl: "https://www.investmentnews.com/",
      category: "firm"
    },
    {
      title: "Raymond James Enhances Technology Platform for Independent Advisors",
      excerpt: "Raymond James has announced significant enhancements to its technology platform for independent advisors, including new CRM integration and advanced financial planning capabilities.",
      date: getDate(16),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      category: "firm"
    },
    {
      title: "Raymond James Recruits $600M UBS Team in Northeast",
      excerpt: "Raymond James has attracted a UBS team that managed approximately $600 million in client assets to join its independent advisor channel in the Northeast region.",
      date: getDate(2),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
    {
      title: "Raymond James Increases Recruiting Bonuses for Mid-Tier Advisors",
      excerpt: "Raymond James has reportedly enhanced its recruiting package for mid-tier advisors managing between $100M-$300M, offering more competitive upfront and backend incentives.",
      date: getDate(13),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=3540&ixlib=rb-4.0.3",
      category: "industry"
    },
  ],
  
  // Default news items for firms that don't have specific news
  "default": [
    {
      title: "Advisory Firm Welcomes New Team from Wirehouse",
      excerpt: "A team managing approximately $350 million in client assets has joined from a major wirehouse, citing the firm's technology platform and client-focused approach.",
      date: getDate(5),
      source: "AdvisorHub",
      sourceUrl: "https://advisorhub.com/",
      category: "move"
    },
    {
      title: "Firm Announces Expansion into New Markets",
      excerpt: "The wealth management firm has announced plans to expand into three new metropolitan markets, with a focus on recruiting experienced advisor teams.",
      date: getDate(12),
      source: "InvestmentNews",
      sourceUrl: "https://www.investmentnews.com/",
      imageUrl: "https://images.unsplash.com/photo-1560520031-3a4dc4e9de0c?auto=format&fit=crop&q=80&w=3387&ixlib=rb-4.0.3",
      category: "firm"
    },
    {
      title: "Advisor Team Launches Independent Practice",
      excerpt: "A veteran advisor team managing over $400 million has departed to establish an independent practice, partnering with a strategic platform provider.",
      date: getDate(8),
      source: "RIABiz",
      sourceUrl: "https://riabiz.com/",
      category: "move"
    },
    {
      title: "New Technology Integration Announced for Advisors",
      excerpt: "The firm has unveiled a new technology integration that will enhance financial planning capabilities and improve client engagement tools for advisors.",
      date: getDate(15),
      source: "Financial Planning",
      sourceUrl: "https://www.financial-planning.com/",
      category: "firm"
    },
    {
      title: "Firm Reports Strong Growth in Assets Under Management",
      excerpt: "The wealth management firm reported a 15% increase in assets under management for the first quarter, driven by both net new assets and market appreciation.",
      date: getDate(10),
      source: "FaAxis",
      sourceUrl: "https://faaxis.com",
      category: "firm"
    },
  ]
};

// Function to get news for a specific firm
export function getNewsForFirm(firmId: string): NewsItem[] {
  return firmNewsData[firmId] || firmNewsData.default;
}