import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn, Linkedin, Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#0D0F18] border-t border-border/30 py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <h1 className="text-2xl font-bold">
                <span className="text-white font-normal text-sm">financial</span>
                <span className="text-primary ml-1 font-semibold">AXIS</span>
              </h1>
            </div>
            <p className="text-sm text-[#6B7280] max-w-md mb-4">
              A comprehensive comparison platform that helps financial advisors make data-driven
              decisions about their career transitions and maximize compensation packages.
            </p>
            <div className="flex space-x-3 items-center mb-4">
              <a 
                href="https://www.linkedin.com/company/faaxis/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#6B7280] hover:text-primary transition-colors"
                aria-label="FaAxis LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href="mailto:info@faaxis.com" 
                className="text-[#6B7280] hover:text-primary transition-colors"
                aria-label="Email FaAxis"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/calculator">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer" aria-label="Transitions calculator">
                      Transitions
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/marketplace">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer" aria-label="Buy-Sell marketplace">
                      Buy–Sell
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/marketing">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer" aria-label="Marketing resources">
                      Marketing
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/news">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer" aria-label="Industry news">
                      News
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/auth">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer flex items-center">
                      <LogIn className="h-3 w-3 mr-1" />
                      Login
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/privacy">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      Privacy Policy
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      Terms of Service
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      FAQ
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/careers">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      Careers
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/feedback">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      Feedback
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/about">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      About Us
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/firm-profiles">
                    <span className="text-sm text-[#6B7280] hover:text-primary transition-colors cursor-pointer">
                      Firm Profiles
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-white mb-4">Join Us</h4>
            <div className="space-y-4">
              <p className="text-sm text-[#6B7280] max-w-md mb-4">
                Ready to maximize your transition? Create a free account today.
              </p>
              <Link href="/auth">
                <Button className="w-full md:w-auto" size="sm" variant="secondary">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/30 mt-8 pt-8 text-xs text-[#6B7280] text-center">
          <p className="mb-4">© {currentYear} Financial Axis. All rights reserved.</p>
          <p className="mb-4 max-w-5xl mx-auto">
            FaAxis, though an expert in financial advisor transitions with over 20 years of industry experience, operates independently and without affiliation to any governmental or regulatory body. This includes, but is not limited to, well-known organizations such as the Financial Industry Regulatory Authority (FINRA) and the Securities and Exchange Commission (SEC). We are not members of these or any other regulatory entities. While we provide comprehensive information on advisory services, it is important to note that FaAxis is a technology company, and the content on this site is for informational and educational purposes only. We do not engage in the solicitation of securities transactions, nor do we offer personalized investment advice for compensation over the Internet. All communication with potential clients is conducted by appropriately registered representatives or those exempt from registration in the client's state. FaAxis is a U.S.-based firm dedicated to maintaining the highest standards of privacy. We do not sell your data, spam, or share your information without your consent. Although we strive for accuracy, the information presented may contain inaccuracies for which we assume no liability. The firms mentioned on this site are not represented by us, and any content related to them should be viewed as speculative rather than definitive employment offers. We exercise our right to freedom of speech under the U.S. Constitution by providing this information. This website is intended solely to inform and educate, not to solicit. Our operations do not require specific licenses except where legally mandated. How We Make Money – At FaAxis, our mission is to provide you with the best transition experience at no cost to you. We partner with over a hundred top broker-dealers who retain our services to connect them with talented advisors like you. This allows us to offer comprehensive transition deal and real-time offer comparisons without any fees for our users. Our commitment to transparency ensures you have the freedom to make the best decision for your career without any hidden costs. We believe in empowering financial advisors to achieve their fullest potential, backed by our extensive network and innovative AI technology.
          </p>
        </div>
      </div>
    </footer>
  );
}