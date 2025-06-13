import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="max-w-4xl mx-auto mt-10">
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Find answers to common questions about our financial advisor transition tools and services
              </p>
            </div>
            
            <div className="mb-8 hidden md:block">
              <div className="bg-muted/30 p-6 rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("general")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "general" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "general" ? "text-foreground font-medium" : "text-muted-foreground"}>General Questions</span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("calculator")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "calculator" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "calculator" ? "text-foreground font-medium" : "text-muted-foreground"}>Calculator & Tools</span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("firms")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "firms" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "firms" ? "text-foreground font-medium" : "text-muted-foreground"}>Firm Data & Coverage</span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("subscription")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "subscription" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "subscription" ? "text-foreground font-medium" : "text-muted-foreground"}>Pricing & Subscriptions</span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("privacy")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "privacy" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "privacy" ? "text-foreground font-medium" : "text-muted-foreground"}>Privacy & Security</span>
                  </div>
                  <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab("support")}>
                    <div className={`w-2 h-2 rounded-full ${activeTab === "support" ? "bg-primary" : "bg-muted-foreground/30"}`}></div>
                    <span className={activeTab === "support" ? "text-foreground font-medium" : "text-muted-foreground"}>Support & Help</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 md:hidden">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="calculator">Calculator</TabsTrigger>
                <TabsTrigger value="firms">Firms</TabsTrigger>
                <TabsTrigger value="subscription">Pricing</TabsTrigger>
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
              
              {/* General Questions Tab */}
              <TabsContent value="general" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">General Questions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="what-is-fa-axis">
                    <AccordionTrigger>What is FA Axis?</AccordionTrigger>
                    <AccordionContent>
                      FA Axis is a specialized platform designed to help financial advisors analyze, compare, 
                      and maximize transition packages when moving between firms. Our tools use real market data 
                      to calculate potential compensation across various firms, helping you make data-driven 
                      career decisions without pressure from recruiters or firms with vested interests.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="who-should-use">
                    <AccordionTrigger>Who should use FA Axis?</AccordionTrigger>
                    <AccordionContent>
                      FA Axis is designed for financial advisors who are considering a transition between firms,
                      want to understand their market value, or are negotiating compensation packages. It's valuable
                      for advisors at wirehouse firms, independent broker-dealers, RIAs, and banks who want to 
                      compare options objectively. Our platform is particularly helpful for advisors who:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Are considering a move within the next 12-24 months</li>
                        <li>Want to understand their true market value</li>
                        <li>Need to compare multiple offers objectively</li>
                        <li>Are evaluating the long-term implications of different affiliation models</li>
                        <li>Want to negotiate better terms with potential firms</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-source">
                    <AccordionTrigger>Where does your data come from?</AccordionTrigger>
                    <AccordionContent>
                      Our data is sourced from real market transactions, firm-reported transition packages, 
                      industry connections, and ongoing research into compensation trends. We continuously update 
                      our database to reflect current market conditions and firm-specific changes to recruiting 
                      packages. Our team includes former industry recruiters and transition specialists who provide
                      insider knowledge on current deal structures. We also gather anonymized data from advisors
                      who have recently transitioned, creating a robust and accurate picture of the current market.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="guarantee">
                    <AccordionTrigger>Do you guarantee the accuracy of compensation projections?</AccordionTrigger>
                    <AccordionContent>
                      While we strive for accuracy using the most current market data, our tools provide estimates 
                      and projections rather than guarantees. Actual transition packages may vary based on negotiation, 
                      specific circumstances, and changes in firm policies. We recommend using our tools as a starting 
                      point for discussions with potential firms. Our data is typically accurate within +/- 10% of 
                      actual offers, though specialized practices or unique circumstances may result in greater
                      variations.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="mobile-compatible">
                    <AccordionTrigger>Is FA Axis compatible with mobile devices?</AccordionTrigger>
                    <AccordionContent>
                      Yes, FA Axis is fully responsive and works on smartphones, tablets, and desktop computers.
                      You can access all features and calculations from any device with a web browser. The interface
                      automatically adapts to different screen sizes, ensuring a seamless experience whether you're
                      at your desk or on the go. No app download is required—simply visit our website on your
                      preferred device.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="confidentiality">
                    <AccordionTrigger>How is my information kept confidential?</AccordionTrigger>
                    <AccordionContent>
                      We understand the sensitive nature of transition planning. Your information is kept strictly
                      confidential through several security measures:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>End-to-end encryption for all data transmission</li>
                        <li>Secure servers with regular security audits</li>
                        <li>No sharing of personal information with firms or recruiters</li>
                        <li>Option to use anonymized calculations without creating an account</li>
                        <li>Data anonymization for any aggregated research</li>
                      </ul>
                      We never sell your information to third parties, and we do not notify firms about your
                      interest unless you explicitly request us to make an introduction.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="broker-protocol">
                    <AccordionTrigger>Does FA Axis provide information about the Broker Protocol?</AccordionTrigger>
                    <AccordionContent>
                      Yes, premium subscribers receive access to our comprehensive Broker Protocol guide, which includes:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Up-to-date list of participating firms</li>
                        <li>Detailed explanation of permitted client information</li>
                        <li>Step-by-step process for compliant transitions</li>
                        <li>Firm-specific protocol nuances</li>
                        <li>Sample notification letters and templates</li>
                      </ul>
                      Our guide is regularly updated to reflect changes in protocol participants and regulations.
                      However, we recommend consulting with a legal professional for advice specific to your situation
                      as the protocol continues to evolve.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Calculator Questions Tab */}
              <TabsContent value="calculator" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Calculator & Tools</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="how-calculator-works">
                    <AccordionTrigger>How does the calculator work?</AccordionTrigger>
                    <AccordionContent>
                      Our calculator uses your key metrics (AUM, revenue, fee-based percentage, location) along 
                      with our proprietary database of firm transition packages to generate personalized projections.
                      The calculator factors in upfront payments, backend bonuses, grid rates, and growth projections
                      to provide a comprehensive multi-year analysis of potential compensation across different firms.
                      Our algorithms account for regional variations, firm-specific program enhancements, and
                      market conditions to deliver accurate, actionable insights tailored to your practice profile.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="calculator-metrics">
                    <AccordionTrigger>What metrics should I provide for the most accurate results?</AccordionTrigger>
                    <AccordionContent>
                      For the most accurate results, we recommend providing:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Trailing 12-month revenue (exact amount)</li>
                        <li>Assets under management (AUM)</li>
                        <li>Percentage of fee-based (recurring) revenue</li>
                        <li>Current firm affiliation</li>
                        <li>Geographic region or city</li>
                        <li>Client composition (optional but helpful)</li>
                        <li>Production breakdown by product type (optional)</li>
                        <li>Years of experience (optional)</li>
                      </ul>
                      The more detailed information you provide, the more precise our calculations can be. 
                      Premium subscribers can input additional data points for even more tailored projections.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="save-results">
                    <AccordionTrigger>Can I save my calculation results?</AccordionTrigger>
                    <AccordionContent>
                      Yes, premium subscribers can save multiple calculation scenarios to their account dashboard.
                      This allows you to:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Compare different scenarios side-by-side</li>
                        <li>Track how changes to your practice affect offers over time</li>
                        <li>Reference results during actual negotiations</li>
                        <li>Export data to PDF or Excel formats</li>
                        <li>Share results with trusted advisors (optional)</li>
                      </ul>
                      Free users can perform calculations but cannot save results for future reference.
                      Premium accounts can store up to 25 different scenarios simultaneously.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="adjustments">
                    <AccordionTrigger>Can I adjust parameters to see different scenarios?</AccordionTrigger>
                    <AccordionContent>
                      Premium subscribers can adjust numerous parameters to model different scenarios, including:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Annual growth rate assumptions (AUM and revenue)</li>
                        <li>Production mix changes over time</li>
                        <li>Grid payout adjustments</li>
                        <li>Client retention percentages during transition</li>
                        <li>Backend bonus achievement thresholds</li>
                        <li>Timing of transition (market conditions)</li>
                      </ul>
                      This customization helps you understand how changes in your business might affect
                      transition packages and long-term earnings potential across different firms and models.
                      You can create "what-if" scenarios to optimize your transition strategy.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="advanced-tools">
                    <AccordionTrigger>What other tools are available beyond the basic calculator?</AccordionTrigger>
                    <AccordionContent>
                      Premium subscribers gain access to several advanced tools:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Transition ROI Calculator:</strong> Analyze the true cost/benefit of moving, including short-term disruption</li>
                        <li><strong>Independence Analyzer:</strong> Detailed breakdown of costs and benefits of going independent</li>
                        <li><strong>Client Retention Probability Tool:</strong> Estimate likely client retention based on relationship factors</li>
                        <li><strong>Tax Impact Estimator:</strong> Understand the tax implications of different compensation structures</li>
                        <li><strong>Deal Negotiation Assistant:</strong> Identify leverage points for negotiating better terms</li>
                        <li><strong>Retirement Valuation Tool:</strong> Compare sunset programs and succession options</li>
                      </ul>
                      These specialized tools provide deeper insights into specific aspects of the transition process.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="accuracy-calculations">
                    <AccordionTrigger>How often is the calculator data updated?</AccordionTrigger>
                    <AccordionContent>
                      We update our database continuously as new information becomes available. Major firm-wide
                      program changes are typically reflected within 24-48 hours of announcement. Our team conducts:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Monthly comprehensive reviews of all firm programs</li>
                        <li>Quarterly deep-dive analysis of market trends</li>
                        <li>Real-time updates when significant changes occur</li>
                        <li>Annual verification with industry sources</li>
                      </ul>
                      When you run a calculation, you'll always see the last update date for each firm's data,
                      ensuring complete transparency about the recency of the information being used.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Firms Tab */}
              <TabsContent value="firms" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Firm Data & Coverage</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="firms-covered">
                    <AccordionTrigger>Which firms are covered in your database?</AccordionTrigger>
                    <AccordionContent>
                      Our database includes:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Wirehouses:</strong> Morgan Stanley, Merrill Lynch, UBS, Wells Fargo Advisors</li>
                        <li><strong>Regional firms:</strong> Raymond James, RBC, Stifel, Janney Montgomery Scott, Baird</li>
                        <li><strong>Independent broker-dealers:</strong> LPL, Ameriprise, Commonwealth, Cambridge, Cetera</li>
                        <li><strong>Banks:</strong> JP Morgan, Fifth Third, Truist, KeyBank, PNC Investments</li>
                        <li><strong>Boutique wealth management:</strong> Rockefeller, First Republic, Steward Partners, Dynasty</li>
                        <li><strong>RIA platforms:</strong> Focus Financial, HighTower, Dynasty, Carson Group</li>
                      </ul>
                      In total, we track over 40 firms and platforms across all major channels.
                      We regularly add new firms based on market relevance and user requests.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="firm-comparison">
                    <AccordionTrigger>How many firms can I compare at once?</AccordionTrigger>
                    <AccordionContent>
                      Free users can compare up to 3 firms at once. Premium subscribers can compare unlimited firms
                      simultaneously, allowing for comprehensive analysis across the entire market. This helps you
                      identify the optimal transition options for your specific practice. Our comparison view offers:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Side-by-side deal structure breakdowns</li>
                        <li>9-year compensation projections</li>
                        <li>Visual graphs of cumulative earnings</li>
                        <li>Detailed grid analysis for each firm</li>
                        <li>Highlighted differences between offers</li>
                      </ul>
                      Premium subscribers can also create custom firm groupings for targeted comparisons.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="firm-tiers">
                    <AccordionTrigger>Do you account for different tiers within firms?</AccordionTrigger>
                    <AccordionContent>
                      Yes, our premium calculations take into account different tiers and specialized programs within
                      firms when applicable. This includes:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Elite/Chairman's Club level enhancements</li>
                        <li>Production-based tier structures</li>
                        <li>Specialized practice bonuses (high-net-worth, institutional, etc.)</li>
                        <li>Geographic incentives for priority markets</li>
                        <li>Team vs. individual advisor differences</li>
                      </ul>
                      Many firms offer enhanced packages for advisors meeting certain thresholds
                      or with specialized practices. Our detailed analysis can reflect these differences.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="missing-firm">
                    <AccordionTrigger>What if a firm I'm interested in isn't listed?</AccordionTrigger>
                    <AccordionContent>
                      Contact us through the support channel, and we'll work to add the firm to our database if sufficient
                      data is available. Premium subscribers receive priority for firm addition requests. When requesting
                      a new firm, it's helpful to provide:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>The full name of the firm</li>
                        <li>Any public information about their transition packages</li>
                        <li>Contact information for the firm (optional)</li>
                        <li>Why you're interested in this particular firm</li>
                      </ul>
                      We're constantly expanding our coverage based on market trends and user needs, and typically
                      can add requested firms within 2-3 weeks, depending on data availability.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="firm-data-accuracy">
                    <AccordionTrigger>How do you ensure firm data accuracy?</AccordionTrigger>
                    <AccordionContent>
                      We maintain data accuracy through a multi-layered verification process:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Direct relationships with firm recruiters (non-disclosure agreements in place)</li>
                        <li>Verification from multiple recently transitioned advisors</li>
                        <li>Cross-referencing with industry publications and reports</li>
                        <li>Continuous monitoring of firm announcements and policy changes</li>
                        <li>Quarterly outreach to industry sources for validation</li>
                      </ul>
                      Each data point in our system includes a confidence score and last verification date.
                      We prioritize accuracy over breadth, choosing not to include firms where reliable
                      data cannot be obtained or verified.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="independent-models">
                    <AccordionTrigger>How do you handle RIA and independent models?</AccordionTrigger>
                    <AccordionContent>
                      For RIA and independent models, our calculations include:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Startup costs and capital requirements</li>
                        <li>Platform fees and technology expenses</li>
                        <li>Potential financing options and terms</li>
                        <li>Ongoing revenue splits with platforms (if applicable)</li>
                        <li>Estimated business valuation growth over time</li>
                        <li>Tax implications of business ownership</li>
                      </ul>
                      Premium subscribers receive access to our Independence Analyzer tool, which provides
                      detailed breakdowns of the costs, benefits, and ROI timeline of transitioning to
                      independence, including various affiliation models and service providers.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Subscription Tab */}
              <TabsContent value="subscription" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Pricing & Subscriptions</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="free-vs-premium">
                    <AccordionTrigger>What's the difference between free and premium access?</AccordionTrigger>
                    <AccordionContent>
                      <div className="not-prose my-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="border border-border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-4">Free Access</h3>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Basic compensation calculator</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Compare up to 3 firms</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Standard parameter options</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Educational resources access</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-muted-foreground">No saved scenarios</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="text-muted-foreground">Limited data exports</span>
                              </li>
                            </ul>
                          </div>
                          <div className="border border-primary rounded-lg p-6 bg-primary/5">
                            <h3 className="text-lg font-semibold mb-4">Premium Access</h3>
                            <ul className="space-y-2">
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Advanced calculator with detailed projections</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Unlimited firm comparisons</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Customizable parameters & assumptions</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save and manage multiple scenarios</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Advanced tools (Transition ROI, Independence)</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Detailed firm information & insights</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>PDF/Excel exports</span>
                              </li>
                              <li className="flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Priority support</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      Premium is designed for advisors actively exploring transitions who need comprehensive
                      information and analysis tools. Our free tier is ideal for advisors in the early
                      stages of research or those looking for basic comparisons.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="subscription-cost">
                    <AccordionTrigger>How much does a premium subscription cost?</AccordionTrigger>
                    <AccordionContent>
                      Premium subscription is available at the following rates:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Monthly Plan:</strong> $99 per month, billed monthly</li>
                        <li><strong>Annual Plan:</strong> $899 per year (equivalent to $74.92/month, saving 25%)</li>
                        <li><strong>Team Plans:</strong> Custom pricing for offices with multiple advisors (contact us)</li>
                      </ul>
                      For teams or enterprises needing multiple accounts, please contact us for special rates.
                      Our pricing is designed to be a fraction of the value gained from an optimized transition package.
                      Consider that even a 1% improvement in your transition package could represent tens of thousands
                      of dollars in additional compensation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="cancel-subscription">
                    <AccordionTrigger>Can I cancel my premium subscription anytime?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you can cancel your subscription at any time through your account dashboard.
                      When you cancel:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Monthly subscriptions will remain active until the end of the current billing period</li>
                        <li>Annual subscriptions will remain active until the end of the year-long term</li>
                        <li>No refunds are provided for partial subscription periods</li>
                        <li>Your saved scenarios will be accessible until your subscription expires</li>
                        <li>After expiration, your account reverts to free access (scenarios are archived but not deleted)</li>
                      </ul>
                      If you reactivate your subscription within 90 days, all your previous saved scenarios
                      will be automatically restored.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="payment-security">
                    <AccordionTrigger>How do you handle payment security?</AccordionTrigger>
                    <AccordionContent>
                      We use Stripe, an industry-leading payment processor, to handle all transactions securely.
                      Our payment security measures include:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>No storage of complete credit card information on our servers</li>
                        <li>Encryption of all payment data according to PCI DSS standards</li>
                        <li>Secure tokenization of payment methods</li>
                        <li>Regular security audits and compliance checks</li>
                        <li>SSL/TLS encryption for all transaction data</li>
                      </ul>
                      For additional security, we offer two-factor authentication for account access
                      and the option to use single sign-on through trusted identity providers.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="trial-period">
                    <AccordionTrigger>Do you offer a free trial of premium features?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we offer a 7-day free trial of our premium features. During your trial:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>You'll have full access to all premium features</li>
                        <li>No credit card is required to start the trial</li>
                        <li>You'll receive a reminder email 2 days before the trial ends</li>
                        <li>You can upgrade to a paid plan at any time during or after the trial</li>
                        <li>If you don't upgrade, your account automatically reverts to free access</li>
                      </ul>
                      We believe our platform's value becomes obvious once you experience the premium features,
                      which is why we offer this risk-free trial option for all new users.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Privacy Tab */}
              <TabsContent value="privacy" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Privacy & Security</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="data-collected">
                    <AccordionTrigger>What data do you collect about me?</AccordionTrigger>
                    <AccordionContent>
                      We collect the following types of information:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Account information:</strong> Name, email, password (encrypted)</li>
                        <li><strong>Professional details:</strong> AUM, revenue, business mix (for calculations)</li>
                        <li><strong>Usage information:</strong> How you interact with our platform</li>
                        <li><strong>Payment information:</strong> Processed securely through Stripe</li>
                        <li><strong>Communication records:</strong> Support interactions and preferences</li>
                      </ul>
                      For complete details on our data collection practices, please review our
                      <a href="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</a>.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-sharing">
                    <AccordionTrigger>Do you share my information with firms or recruiters?</AccordionTrigger>
                    <AccordionContent>
                      <strong>No, we never share your personal information with firms or recruiters without your explicit consent.</strong>
                      <p className="mt-2">
                        We understand the sensitive nature of considering a transition, and we maintain strict confidentiality of all user data. 
                        Your information is used solely to provide you with accurate calculations and insights. 
                        We do not sell your data or share it with any third parties who might contact you about recruiting opportunities.
                      </p>
                      <p className="mt-2">
                        If you're interested in being connected with specific firms, we offer an optional introduction service,
                        but this is only activated when you explicitly request it and provide consent for us to share your information.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-security">
                    <AccordionTrigger>How do you protect my data?</AccordionTrigger>
                    <AccordionContent>
                      We implement robust security measures to protect your information:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Encryption:</strong> All data is encrypted both in transit and at rest</li>
                        <li><strong>Access controls:</strong> Strict internal access limitations and authentication</li>
                        <li><strong>Regular audits:</strong> Ongoing security assessments and vulnerability testing</li>
                        <li><strong>Secure infrastructure:</strong> Industry-standard hosting with advanced protections</li>
                        <li><strong>Data minimization:</strong> We only collect what's necessary for service provision</li>
                      </ul>
                      We also offer two-factor authentication for your account and employ best practices for
                      password storage and management. Our team receives regular security training, and we
                      maintain incident response procedures in the unlikely event of a security issue.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="data-deletion">
                    <AccordionTrigger>Can I delete my data?</AccordionTrigger>
                    <AccordionContent>
                      Yes, you have several options for controlling your data:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Delete individual saved scenarios from your dashboard</li>
                        <li>Request deletion of specific information via your account settings</li>
                        <li>Close your account completely, which removes all personal information</li>
                        <li>Request a data export before deletion (available in account settings)</li>
                      </ul>
                      <p className="mt-2">
                        To completely delete your account and all associated data, go to Account Settings, then Privacy, then 
                        Delete Account. Alternatively, you can contact our support team, and we'll process your 
                        deletion request within 30 days as required by applicable privacy laws.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="anonymous-use">
                    <AccordionTrigger>Can I use the calculator anonymously?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we offer anonymous calculation options:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Basic calculator available without creating an account</li>
                        <li>Option to use placeholder information instead of exact figures</li>
                        <li>No IP address or device fingerprinting for anonymous calculations</li>
                        <li>Results shown directly on screen without storage</li>
                      </ul>
                      However, anonymous use has limitations: you can't save results, access premium features,
                      or maintain a history of calculations. For the most complete experience with privacy safeguards,
                      we recommend creating an account with a strong password and enabling two-factor authentication.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              {/* Support Tab */}
              <TabsContent value="support" className="mt-6">
                <div className="flex items-center mb-6 border-b border-border pb-4">
                  <div className="bg-primary/10 p-2 rounded-full mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Support & Help</h2>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="support-hours">
                    <AccordionTrigger>What are your support hours?</AccordionTrigger>
                    <AccordionContent>
                      Our support team is available:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Monday-Friday:</strong> 8:00 AM - 8:00 PM Eastern Time</li>
                        <li><strong>Saturday:</strong> 10:00 AM - 4:00 PM Eastern Time</li>
                        <li><strong>Sunday:</strong> Limited email support only</li>
                      </ul>
                      Premium subscribers receive priority support with faster response times.
                      Emergency support for critical issues is available 24/7 for premium members.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="contact-methods">
                    <AccordionTrigger>How can I contact support?</AccordionTrigger>
                    <AccordionContent>
                      You can reach our support team by email:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Email:</strong> hello@faaxis.com</li>
                        <li><strong>Phone Support:</strong> Available for premium subscribers</li>
                        <li><strong>In-App Support:</strong> Submit tickets directly from your dashboard</li>
                      </ul>
                      For all inquiries about your account or subscription, email is the fastest way to get assistance.
                      Premium subscribers also have access to expedited support services.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="response-times">
                    <AccordionTrigger>What are typical response times?</AccordionTrigger>
                    <AccordionContent>
                      Our typical response times are:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Free users:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Email: Within 24 business hours</li>
                          </ul>
                        </li>
                        <li><strong>Premium subscribers:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Email: Within 4 business hours</li>
                            <li>Phone support: Same day callback during business hours</li>
                          </ul>
                        </li>
                      </ul>
                      Our team tracks response time metrics and strives to exceed these standards.
                      During peak periods, response times may be slightly longer, but we'll always
                      keep you updated on expected resolution timeframes.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="training-resources">
                    <AccordionTrigger>Do you offer training or tutorials?</AccordionTrigger>
                    <AccordionContent>
                      Yes, we provide multiple resources to help you get the most from our platform:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><strong>Video Tutorials:</strong> Short videos demonstrating key features</li>
                        <li><strong>Webinars:</strong> Monthly live training sessions (free for all users)</li>
                        <li><strong>Quick Start Guide:</strong> Sent to all new users via email</li>
                        <li><strong>Tooltips:</strong> In-app contextual help for various features</li>
                      </ul>
                      Premium subscribers also receive access to one-on-one onboarding sessions
                      where a team member will walk you through the platform based on your specific needs.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="feature-requests">
                    <AccordionTrigger>How can I request new features?</AccordionTrigger>
                    <AccordionContent>
                      We welcome feature suggestions from our users:
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>Submit ideas through the "Feature Request" form in your dashboard</li>
                        <li>Email suggestions to features@faaxis.com</li>
                        <li>Participate in our quarterly user feedback surveys</li>
                        <li>Join our user testing program for early access to new features</li>
                      </ul>
                      We review all requests and prioritize development based on user demand and strategic alignment.
                      While we can't implement every suggestion, we carefully consider all feedback and
                      regularly update our product roadmap based on user needs. Premium subscribers' requests
                      receive priority consideration in our development queue.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </Tabs>
            
            <div className="mt-12 bg-muted/20 rounded-xl p-8 border border-border/50 text-center">
              <h2 className="text-2xl font-bold mb-4">Didn't Find Your Answer?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Our support team is ready to help with any additional questions you may have about our platform or services.
              </p>
              <div className="flex justify-center">
                <a href="mailto:hello@faaxis.com" className="inline-flex items-center justify-center px-6 py-3 border border-primary rounded-md bg-primary text-white hover:bg-primary/90 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}