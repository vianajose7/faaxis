import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Landmark, DollarSign, Link as LinkIcon, Globe, Twitter, Linkedin, Instagram, UserRound, Award } from "lucide-react";


interface FirmLeadership {
  ceo: string;
  ceoTitle: string;
  ceoImage?: string;
  otherLeaders: {
    name: string;
    title: string;
    image?: string;
  }[];
}

interface FirmProfile {
  name: string;
  description: string;
  logo: React.ReactNode;
  industry: string;
  founded: string;
  headquarters: string;
  advisorCount: string;
  averageAum: string;
  averageClient: string;
  website: string;
  leadership: FirmLeadership;
  social: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

const companyProfiles: Record<string, FirmProfile> = {
  "morgan stanley": {
    name: "Morgan Stanley",
    description: "Morgan Stanley is a leading global financial services firm providing investment banking, securities, wealth management and investment management services.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#1B365D] font-bold text-xl">
              <svg viewBox="0 0 500 500" width="100%" height="100%" className="fill-current">
                <path d="M25 157h450v186H25V157z"/>
                <path fill="#fff" d="M100 220.7h39.5v58.6H100v-58.6zm130.4 0h39.5v58.6h-39.5v-58.6zm130.3 0h39.5v58.6h-39.5v-58.6zM25 157h124.5v186H25V157zm162.9 0H313v186H187.9V157zm162.8 0H475v186H350.7V157z"/>
              </svg>
            </div>,
    industry: "Financial Services",
    founded: "1935",
    headquarters: "New York, NY",
    advisorCount: "15,000+",
    averageAum: "$175M",
    averageClient: "High Net Worth, Ultra High Net Worth",
    website: "morganstanley.com",
    leadership: {
      ceo: "Ted Pick",
      ceoTitle: "Chief Executive Officer",
      otherLeaders: [
        {
          name: "Andy Saperstein",
          title: "Co-President and Head of Wealth Management"
        },
        {
          name: "Dan Simkowitz",
          title: "Co-President and Head of Investment Management"
        }
      ]
    },
    social: {
      twitter: "MorganStanley",
      linkedin: "morgan-stanley",
      instagram: "morgan.stanley"
    }
  },
  "merrill lynch": {
    name: "Merrill Lynch",
    description: "Merrill Lynch Wealth Management is a wealth management division of Bank of America, providing personalized wealth management services.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#0073CF] font-bold text-xl">
              <svg viewBox="0 0 50 50" width="100%" height="100%" className="fill-current">
                <path d="M25 2C12.31 2 2 12.31 2 25s10.31 23 23 23 23-10.31 23-23S37.69 2 25 2zm0 2c11.61 0 21 9.39 21 21s-9.39 21-21 21S4 36.61 4 25 13.39 4 25 4z"/>
                <path d="M14 20v15h3V20h-3zm4 0v15h3V20h-3zm13 0v9h3v-9h-3zm-9 0v15h5v-5h-2v-5h2v-5h-5z"/>
              </svg>
            </div>,
    industry: "Wealth Management",
    founded: "1914",
    headquarters: "New York, NY",
    advisorCount: "14,000+",
    averageAum: "$160M",
    averageClient: "Affluent, High Net Worth",
    website: "ml.com",
    leadership: {
      ceo: "Brian Moynihan",
      ceoTitle: "CEO of Bank of America",
      otherLeaders: [
        {
          name: "Lindsay Hans",
          title: "President of Merrill Wealth Management"
        },
        {
          name: "Eric Schimpf",
          title: "Co-Head of Merrill Wealth Management"
        }
      ]
    },
    social: {
      twitter: "MerrillLynch",
      linkedin: "merrill-lynch"
    }
  },
  "ubs": {
    name: "UBS Wealth Management",
    description: "UBS Wealth Management provides holistic advice to high net worth and ultra high net worth individuals around the world.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#EC0016] font-bold text-xl">
              <svg viewBox="0 0 48 48" width="100%" height="100%" className="fill-current">
                <path d="M9.6 14.5c-.9 0-1.6.7-1.6 1.6v15.8c0 .9.7 1.6 1.6 1.6h28.8c.9 0 1.6-.7 1.6-1.6V16.1c0-.9-.7-1.6-1.6-1.6H9.6zm10.7 3h7.4v12.9h-7.4V17.5zm-8.5 0h7.4v12.9h-7.4V17.5zm17.5 0h7.4v12.9h-7.4V17.5z"/>
              </svg>
            </div>,
    industry: "Wealth Management",
    founded: "1862",
    headquarters: "Zurich, Switzerland",
    advisorCount: "10,000+", 
    averageAum: "$180M",
    averageClient: "High Net Worth, Ultra High Net Worth",
    website: "ubs.com",
    leadership: {
      ceo: "Sergio Ermotti",
      ceoTitle: "Group Chief Executive Officer",
      otherLeaders: [
        {
          name: "Iqbal Khan",
          title: "President of UBS Global Wealth Management"
        },
        {
          name: "Jason Chandler",
          title: "Head of Wealth Management USA"
        }
      ]
    },
    social: {
      twitter: "UBS",
      linkedin: "ubs",
      instagram: "ubs"
    }
  },
  "raymond james": {
    name: "Raymond James",
    description: "Raymond James Financial is a diversified financial services company offering private client, capital markets, asset management, and banking services.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#0066CC] font-bold text-xl">
              <svg viewBox="0 0 60 60" width="100%" height="100%" className="fill-current">
                <path d="M10 19.3h13.6v1.9H10v-1.9zm0 4.2h13.6v1.9H10v-1.9zm30-4.2h10v1.9H40v-1.9zm0 4.2h10v1.9H40v-1.9zm-15 3.7h10v16.3H25V27.2zm-15 0h10v16.3H10V27.2zm30 0h10v16.3H40V27.2zM5 14.7h50v30.6H5z"/>
              </svg>
            </div>,
    industry: "Wealth Management",
    founded: "1962",
    headquarters: "St. Petersburg, FL",
    advisorCount: "8,700+",
    averageAum: "$150M",
    averageClient: "Affluent, High Net Worth",
    website: "raymondjames.com",
    leadership: {
      ceo: "Paul Reilly",
      ceoTitle: "Chairman and Chief Executive Officer",
      otherLeaders: [
        {
          name: "Tash Elwyn",
          title: "President and CEO of Raymond James & Associates"
        },
        {
          name: "Scott Curtis",
          title: "President of Private Client Group"
        }
      ]
    },
    social: {
      twitter: "RaymondJames",
      linkedin: "raymond-james"
    }
  },
  "ameriprise": {
    name: "Ameriprise Financial",
    description: "Ameriprise Financial is a diversified financial services company providing financial planning, asset management and insurance.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#00539B] font-bold text-2xl">
              <svg viewBox="0 0 50 50" width="100%" height="100%" className="fill-current">
                <path d="M25 5C13.954 5 5 13.954 5 25s8.954 20 20 20 20-8.954 20-20S36.046 5 25 5zm0 3c9.389 0 17 7.611 17 17s-7.611 17-17 17S8 34.389 8 25 15.611 8 25 8z"/>
                <path d="M30.61 13.92l-5.604 13.668-5.605-13.667H14v.036c.928.222 1.593.853 1.988 1.89l6.97 16.71h3.836l6.97-16.71c.395-1.037 1.06-1.668 1.988-1.89v-.037h-5.142z"/>
              </svg>
            </div>,
    industry: "Financial Services",
    founded: "1894",
    headquarters: "Minneapolis, MN",
    advisorCount: "10,000+",
    averageAum: "$120M",
    averageClient: "Mass Affluent, Affluent",
    website: "ameriprise.com",
    leadership: {
      ceo: "Jim Cracchiolo",
      ceoTitle: "Chairman and Chief Executive Officer",
      otherLeaders: [
        {
          name: "Bill Williams",
          title: "Executive Vice President, Advice & Wealth Management Products and Solutions"
        },
        {
          name: "Pat O'Connell",
          title: "Executive Vice President, Ameriprise Advisor Group"
        }
      ]
    },
    social: {
      twitter: "Ameriprise",
      linkedin: "ameriprise-financial"
    }
  },
  "lpl financial": {
    name: "LPL Financial",
    description: "LPL Financial is the largest independent broker-dealer in the United States, providing technology, advisory services and practice management support.",
    logo: <div className="h-16 w-16 flex items-center justify-center rounded-lg text-[#006341] font-bold text-xl">
              <svg viewBox="0 0 50 50" width="100%" height="100%" className="fill-current">
                <path d="M10 12h8v26h-8zM21 12h8v26h-8zM32 12h8v16h-8z"/>
              </svg>
            </div>,
    industry: "Independent Broker-Dealer",
    founded: "1989",
    headquarters: "San Diego, CA",
    advisorCount: "17,000+",
    averageAum: "$75M",
    averageClient: "Mass Affluent, Affluent",
    website: "lpl.com",
    leadership: {
      ceo: "Dan Arnold",
      ceoTitle: "President and Chief Executive Officer",
      otherLeaders: [
        {
          name: "Rich Steinmeier",
          title: "Managing Director and Divisional President, Business Development"
        },
        {
          name: "Matt Enyedi",
          title: "Managing Director, Business Solutions"
        }
      ]
    },
    social: {
      twitter: "LPL",
      linkedin: "lpl-financial"
    }
  }
};

// Default profile for any other firms
const defaultProfile: FirmProfile = {
  name: "Independent",
  description: "Independent advisory firms offer personalized financial advice and solutions without the constraints of a large corporate structure.",
  logo: <Building className="h-16 w-16 text-[#4AFF91]" />,
  industry: "Financial Services",
  founded: "Various",
  headquarters: "Various",
  advisorCount: "Varies",
  averageAum: "Varies",
  averageClient: "Varies by Firm",
  website: "",
  leadership: {
    ceo: "Varies by Firm",
    ceoTitle: "Founder/CEO",
    otherLeaders: []
  },
  social: {}
};

interface CompanyProfileProps {
  selectedFirms?: string[];
  firmDeals?: any[];
}

export function CompanyProfile({ 
  selectedFirms, 
  firmDeals,
  isPaid = false 
}: CompanyProfileProps & { isPaid?: boolean }) {
  if (!selectedFirms || selectedFirms.length === 0) {
    return null;
  }
  
  // Create a list of profiles for all selected firms
  // For premium/paid version, show all selected firms instead of just 3
  const limitedSelection = isPaid ? selectedFirms : selectedFirms.slice(0, 3);
  const profiles: FirmProfile[] = limitedSelection.map(selectedFirm => {
    const firmName = selectedFirm.toLowerCase();
    
    // Try to find a predefined profile for this firm
    let foundProfile: FirmProfile | null = null;
    
    // Check if we have a predefined profile
    for (const key in companyProfiles) {
      if (firmName.includes(key)) {
        foundProfile = {...companyProfiles[key]};
        break;
      }
    }
    
    // If no predefined profile, use the default with the firm name
    if (!foundProfile) {
      const firmDeal = firmDeals?.find(deal => 
        deal.firm.toLowerCase() === firmName || 
        deal.firm.toLowerCase().includes(firmName) ||
        firmName.includes(deal.firm.toLowerCase())
      );
      
      foundProfile = {
        ...defaultProfile,
        name: firmDeal?.firm || selectedFirm
      };
    }
    
    return foundProfile;
  });
  
  return (
    <div className="mt-8 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Selected Firm Profiles</h2>
        {isPaid && (
          <div className="text-xs text-primary bg-primary/10 px-3 py-1 rounded-full">
            Premium Detail View
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, index) => (
          <Card key={index} className="border-t-4 border-t-primary overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-4">
              {profile.logo}
              <div>
                <CardTitle className="text-xl">{profile.name}</CardTitle>
                <p className="text-muted-foreground mt-1 text-sm">{profile.description}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Founded:</span>
                    <span className="text-sm">{profile.founded}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Headquarters:</span>
                    <span className="text-sm">{profile.headquarters}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Advisors:</span>
                    <span className="text-sm">{profile.advisorCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Average AUM:</span>
                    <span className="text-sm">{profile.averageAum}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Typical Client:</span>
                    <span className="text-sm">{profile.averageClient}</span>
                  </div>
                  
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <a 
                        href={`https://${profile.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm hover:underline text-primary"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  
                  {/* Leadership information */}
                  <div className="mt-4">
                    <h3 className="text-md font-semibold mb-2 flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-primary" />
                      Leadership
                    </h3>
                    <div className="space-y-2 pl-2 border-l-2 border-muted-foreground/20">
                      <div>
                        <p className="text-sm font-medium">{profile.leadership.ceo}</p>
                        <p className="text-xs text-muted-foreground">{profile.leadership.ceoTitle}</p>
                      </div>
                      
                      {profile.leadership.otherLeaders.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {profile.leadership.otherLeaders.map((leader, idx) => (
                            <div key={idx} className="mt-1">
                              <p className="text-sm font-medium">{leader.name}</p>
                              <p className="text-xs text-muted-foreground">{leader.title}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Social links */}
                {(profile.social.twitter || profile.social.linkedin || profile.social.instagram) && (
                  <div className="flex gap-3 mt-4">
                    {profile.social.twitter && (
                      <a 
                        href={`https://twitter.com/${profile.social.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                      </a>
                    )}
                    {profile.social.linkedin && (
                      <a 
                        href={`https://linkedin.com/company/${profile.social.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                    {profile.social.instagram && (
                      <a 
                        href={`https://instagram.com/${profile.social.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
                
                {/* Enhanced premium content */}
                {isPaid && (
                  <div className="mt-6 pt-4 border-t border-muted">
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Enhanced Profile Details
                    </h3>
                    
                    {/* Culture and values */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Firm Culture & Values</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.name === "Morgan Stanley" ? 
                          "Morgan Stanley promotes a collaborative environment where client interests come first. The firm emphasizes excellence, integrity, and innovation while fostering an entrepreneurial spirit within its institutional framework." : 
                          profile.name === "Merrill Lynch" ?
                          "Merrill Lynch values client relationships above all and operates with a team-based approach. The firm's culture emphasizes integration with Bank of America's broader banking services and a goals-based wealth management approach." :
                          profile.name === "UBS Wealth Management" ?
                          "UBS emphasizes global perspectives and sophisticated wealth management. The firm's Swiss heritage influences its cautious, long-term approach to investing and wealth preservation, particularly for ultra-high-net-worth families." :
                          profile.name === "Raymond James" ?
                          "Raymond James prides itself on advisor independence within a supportive corporate structure. The firm's culture emphasizes conservative management, client service excellence, and giving advisors flexibility in practice management." :
                          `${profile.name} maintains a corporate culture centered around client service excellence, professional development, and collaborative solutions to complex financial challenges.`
                        }
                      </p>
                    </div>
                    
                    {/* Recruiting approach */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Recruiting Approach</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.name === "Morgan Stanley" ? 
                          "Morgan Stanley selectively recruits established advisors with complex client books. The firm offers substantial upfront incentives for advisors with high-net-worth clients, particularly those with lending and banking needs." : 
                          profile.name === "Merrill Lynch" ?
                          "Merrill Lynch targets advisors comfortable with a goals-based, bank-integrated wealth management approach. Their recruiting focuses on both established teams and their advisor development program for next-generation talent." :
                          profile.name === "UBS Wealth Management" ?
                          "UBS aggressively recruits advisors serving ultra-high-net-worth clients, particularly those with international needs. Their offering emphasizes global capabilities and sophisticated investment solutions." :
                          profile.name === "Raymond James" ?
                          "Raymond James targets advisors seeking independence with support. Their recruiting approach emphasizes practice ownership, flexible affiliation models, and a culture that prioritizes advisor autonomy." :
                          `${profile.name} actively recruits established advisors with substantial books of business, offering competitive transition packages and operational support to ensure a smooth client transition.`
                        }
                      </p>
                    </div>
                    
                    {/* Technology platform */}
                    <div className="mb-3">
                      <h4 className="text-sm font-medium mb-1">Technology Platform</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.name === "Morgan Stanley" ? 
                          "Morgan Stanley's advisor platform features sophisticated portfolio analytics, alternative investment access, and integrated banking tools. Their WealthDesk system provides comprehensive household management capabilities." : 
                          profile.name === "Merrill Lynch" ?
                          "Merrill Lynch's platform centers around their Merrill One system with integrated Bank of America banking capabilities. Their technology emphasizes goals-based planning and automated client communications." :
                          profile.name === "UBS Wealth Management" ?
                          "UBS offers advisors global research access, sophisticated portfolio construction tools, and alternative investment platforms. Their technology emphasizes wealth planning for complex multi-generational situations." :
                          profile.name === "Raymond James" ?
                          "Raymond James provides an integrated advisor workstation with open-architecture investment access. Their technology platform emphasizes advisor choice in planning tools and client-facing technology." :
                          `${profile.name} offers a comprehensive technology platform including portfolio management, financial planning, and client relationship tools designed to support sophisticated wealth management practices.`
                        }
                      </p>
                    </div>
                    
                    {/* Compensation structure */}
                    <div>
                      <h4 className="text-sm font-medium mb-1">Compensation Structure</h4>
                      <p className="text-sm text-muted-foreground">
                        {profile.name === "Morgan Stanley" ? 
                          "Morgan Stanley offers a grid-based payout ranging from 30-55% based on production levels, with bonuses for growth, new assets, and banking services. Their retirement program (FACAAP) provides substantial deferred compensation." : 
                          profile.name === "Merrill Lynch" ?
                          "Merrill Lynch uses a growth grid with core payouts from 34-50%, plus growth awards up to 10% more. Team+ bonuses and wealth management banking incentives can significantly enhance total compensation." :
                          profile.name === "UBS Wealth Management" ?
                          "UBS offers grid rates from 30-60% based on production, with enhanced payouts for fee-based business and larger households. Their ALFA program provides attractive retirement benefits for long-term advisors." :
                          profile.name === "Raymond James" ?
                          "Raymond James provides payouts from 40-50% at employee channel, with higher rates in independent channels. Their compensation emphasizes fee-based revenue and offers equity opportunities in certain affiliation models." :
                          `${profile.name} utilizes a competitive compensation structure rewarding production, growth, and client retention, with additional incentives for fee-based business and new client acquisition.`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}