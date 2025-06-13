import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Card } from "@/components/ui/card";
import { Building, ChevronRight, Shield, Users, Briefcase, Award, Clock, History, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="About FaAxis | Financial Advisor Transition Platform"
        description="Learn about FaAxis, the industry-leading AI platform helping financial advisors evaluate deals and grow their practice."
        keywords="FaAxis, about FaAxis, financial advisor transitions, wealth management transitions" 
      />
      <SimpleNavbar />
      
      <PageHeader
        title="About FaAxis"
        description="The technology platform built to help financial advisors grow through better transitions."
      />
      
      <main className="flex-1">
        {/* Mission Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Our Mission</h2>
                <p className="text-muted-foreground text-lg mb-6">
                  FaAxis is on a mission to democratize information for financial advisors. We're transforming the moving process from the opaque, biased, and pressured environment of the past into a transparent, data-driven, and pressure-free decision making process.
                </p>
                <p className="text-muted-foreground text-lg mb-6">
                  Our AI-powered platform delivers personalized insights so advisors can make informed decisions about their careers, whether transitioning between firms or going independent.
                </p>
                <p className="text-muted-foreground text-lg">
                  By providing transparent information and eliminating the traditional gatekeeper role of recruiters, we're leveling the playing field for advisors of all sizes, helping them find their perfect fit without the pressure.
                </p>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-2xl opacity-30"></div>
                <Card className="relative p-8 border-0 shadow-xl dark:bg-card/90 bg-card/90 backdrop-blur-sm">
                  <div className="space-y-8">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <Target className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Our Core Values</h3>
                        <p className="text-muted-foreground">
                          Transparency, innovation, and advisor advocacy are at the heart of everything we do.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <History className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Industry Experience</h3>
                        <p className="text-muted-foreground">
                          Built by veterans with 20+ years of experience in financial advisor transitions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-lg mr-4">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-foreground">Data Security</h3>
                        <p className="text-muted-foreground">
                          Zero data storage. Military-grade encryption. Your information never leaves your device.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* Our Story Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Our Story</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                FaAxis was born from a recognition that financial advisors deserve better during the transition process. Our founder saw firsthand how outdated information and conflicting incentives were leading to suboptimal outcomes for both advisors and their clients.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">The Beginning</h3>
                <p className="text-muted-foreground">
                  After decades of observing the traditional transition models dominated by recruiters and biased information sources, our founder saw an opportunity to revolutionize the industry by creating a truly advisor-first platform focused on transparency and data-driven decisions.
                </p>
              </Card>
              
              <Card className="p-6 border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <Building className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Building The Platform</h3>
                <p className="text-muted-foreground">
                  We assembled a team of industry veterans and technology experts to build a platform that would finally give advisors the unbiased information they need to make the best decisions for their practice and clients. The result is a tool that's accessible to all advisors, regardless of size.
                </p>
              </Card>
              
              <Card className="p-6 border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <ChevronRight className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-foreground">Today & Beyond</h3>
                <p className="text-muted-foreground">
                  FaAxis continues to evolve with new features and datasets, helping thousands of advisors across the country evaluate their options with confidence. Our vision is to become the trusted hub for all financial advisor career decisions and practice growth opportunities.
                </p>
              </Card>
            </div>
          </div>
        </section>
        

        
        {/* Why Choose FaAxis */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Why Choose FaAxis</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Our platform offers unique advantages that transform how financial advisors approach career transitions. We've designed every feature with the advisor's needs at the center.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Shield className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  Complete Confidentiality
                </h3>
                <p className="text-muted-foreground">
                  No data collection, no registration required, and your information never leaves your device. Work confidently without fear of exposure.
                </p>
              </Card>
              
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Award className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  Unmatched Accuracy
                </h3>
                <p className="text-muted-foreground">
                  Our compensation models are constantly updated with the latest deal terms and conditions from across the industry, ensuring the most accurate projections possible.
                </p>
              </Card>
              
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  Time-Saving Efficiency
                </h3>
                <p className="text-muted-foreground">
                  What typically takes weeks of calls with recruiters can be done in minutes on our platform. Compare multiple firms side-by-side with personalized projections.
                </p>
              </Card>
              
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Target className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  Tailored to Your Practice
                </h3>
                <p className="text-muted-foreground">
                  Our AI adapts to your specific practice metrics, product mix, and growth trajectory to deliver truly personalized insights and recommendations.
                </p>
              </Card>
              
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  For Advisors of All Sizes
                </h3>
                <p className="text-muted-foreground">
                  Whether you manage $50 million or $5 billion, our platform provides valuable insights scaled to your practice size and aspirations.
                </p>
              </Card>
              
              <Card className="p-6 border border-border dark:bg-card/60 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center">
                  <Building className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                  Complete Ecosystem
                </h3>
                <p className="text-muted-foreground">
                  Beyond transitions, we provide tools for practice valuation, client transition planning, and ongoing practice growth to support your entire advisor journey.
                </p>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}