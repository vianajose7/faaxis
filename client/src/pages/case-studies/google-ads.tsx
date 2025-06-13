import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, TrendingUp, BarChart, Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function GoogleAdsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="Google Ads Case Study | FaAxis"
        description="Learn how FaAxis helped financial advisors achieve exceptional ROI through targeted Google Ads campaigns."
        keywords="Google Ads case study, financial advisor marketing, digital advertising ROI, PPC for advisors" 
      />
      <SimpleNavbar />
      
      <PageHeader
        title="Google Ads Case Study"
        description="How we help financial advisors achieve exceptional ROI through targeted digital advertising"
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  From Invisible to Indispensable
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  See how we transformed a regional advisory firm's digital presence with a 
                  targeted Google Ads campaign that delivered 315% ROI in just 6 months.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/marketing">
                      Explore Our Marketing Services
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative overflow-hidden rounded-xl border border-muted">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
                <motion.div 
                  className="relative p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-card rounded-lg shadow-lg p-6 relative before:rounded-lg mb-10 z-10">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">Before FaAxis</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Spending $5,000/month on Google Ads with little ROI</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Broad, untargeted keywords capturing unqualified traffic</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Generic landing pages with 1.8% conversion rate</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Average cost per lead: $850</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg shadow-lg p-6 relative z-20 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">After FaAxis</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Reduced monthly ad spend to $3,500 while increasing results</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Hyper-targeted keywords focused on high-value prospects</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Custom landing pages with 7.2% conversion rate</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Reduced cost per lead to $265</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Results Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">The Results</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Through our strategic approach to Google Ads management, we delivered measurable results 
                that directly impacted the firm's bottom line.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Search className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Visibility</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">+218%</h3>
                  <p className="text-muted-foreground">Increase in qualified search impressions</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Conversions</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">315%</h3>
                  <p className="text-muted-foreground">Return on advertising spend (ROAS)</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">New Clients</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">28</h3>
                  <p className="text-muted-foreground">New high-value clients in 6 months</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Strategy Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Our Strategic Approach
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  We transformed their Google Ads approach with a data-driven strategy focused on quality over quantity.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Wealth Segmentation</h3>
                      <p className="text-muted-foreground">
                        We created distinct campaigns targeting different wealth segments, customizing ad copy 
                        and landing pages to address the unique concerns of each audience.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Hyper-Local Targeting</h3>
                      <p className="text-muted-foreground">
                        Instead of competing nationally, we focused on geo-targeted campaigns within high-net-worth 
                        neighborhoods in the firm's service area, reducing wasted spend.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Conversion Optimization</h3>
                      <p className="text-muted-foreground">
                        We developed specialized landing pages with clear value propositions and strong calls-to-action, 
                        A/B testing different approaches to maximize conversion rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="relative rounded-xl border overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <Search className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Google Ads Dashboard</h3>
                    <p className="text-muted-foreground">
                      Visual representation of campaign performance over time
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Client Testimonial */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto opacity-80" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <blockquote className="text-xl md:text-2xl font-medium mb-8">
                "The FaAxis team completely transformed our digital marketing approach. We went from wasting money on clicks that never converted to a laser-focused strategy that delivers qualified prospects consistently month after month."
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">Michael Donovan</p>
                <p className="text-muted-foreground">Managing Partner, Horizon Wealth Advisors</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="bg-card border rounded-xl p-8 md:p-12 shadow-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Digital Marketing?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Let us help you create a custom Google Ads strategy that delivers qualified prospects and measurable ROI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/marketing?plan=marketing-elite">
                      Get Started Today
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/contact">
                      Schedule a Consultation
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}