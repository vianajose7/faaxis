import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, FileText, BarChart, Target, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function ContentMarketingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="Content Marketing Case Study | FaAxis"
        description="How our AI-powered content strategy increased organic traffic by 287% for financial advisory firms."
        keywords="financial advisor content marketing, wealth management SEO, advisor blog strategy, financial content case study" 
      />
      <SimpleNavbar />
      
      <PageHeader
        title="Content Marketing Case Study"
        description="How our AI-powered content strategy increased organic traffic by 287% and doubled client acquisition"
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Content-Driven Growth
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Learn how we transformed a national financial advisory firm's content strategy from 
                  sporadic blog posts to a comprehensive SEO-driven approach that dramatically increased 
                  qualified leads and new client acquisition.
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
                        <span>Inconsistent blog publishing (3-4 posts per quarter)</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>No SEO strategy or keyword research</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>~4,500 monthly organic website visitors</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Lead conversion rate of 0.8% from organic traffic</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg shadow-lg p-6 relative z-20 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">After FaAxis</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Structured content calendar (8-10 posts per month)</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Data-driven SEO strategy targeting high-intent keywords</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>~17,400 monthly organic website visitors</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Lead conversion rate of 2.9% from organic traffic</span>
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
                Our comprehensive content strategy delivered exceptional results across all key metrics, 
                positioning the firm as an authoritative voice in wealth management.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Traffic</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">+287%</h3>
                  <p className="text-muted-foreground">Increase in organic website traffic</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Leads</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">5.8x</h3>
                  <p className="text-muted-foreground">Increase in qualified lead generation</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Rankings</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">42</h3>
                  <p className="text-muted-foreground">First-page Google rankings for target keywords</p>
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
                  We implemented a comprehensive, data-driven content strategy to position the firm as an 
                  authoritative resource for high-net-worth individuals seeking financial guidance.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Keyword Research & Content Mapping</h3>
                      <p className="text-muted-foreground">
                        We conducted extensive keyword research to identify high-intent search terms used by 
                        the firm's ideal clients, then mapped comprehensive content to address each stage of 
                        the decision-making journey.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">AI-Assisted Content Creation</h3>
                      <p className="text-muted-foreground">
                        Our team leveraged advanced AI tools to generate first drafts, which were then refined 
                        by financial subject matter experts to ensure accuracy, compliance, and a unique perspective.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Conversion Optimization</h3>
                      <p className="text-muted-foreground">
                        We implemented strategic CTAs and lead magnets throughout the content, creating clear 
                        pathways to conversion while providing genuine value to readers at every step.
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
                    <FileText className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Content Performance Dashboard</h3>
                    <p className="text-muted-foreground">
                      Visual representation of traffic and conversion growth
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
                "The content strategy FaAxis developed has completely transformed our digital presence. We're now attracting the exact type of clients we want to work with, and they're coming to us already familiar with our approach and philosophy thanks to our content."
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">David Chen</p>
                <p className="text-muted-foreground">Chief Marketing Officer, Precision Wealth Partners</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="bg-card border rounded-xl p-8 md:p-12 shadow-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Content Strategy?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Let our team help you create a data-driven content strategy that attracts qualified prospects and establishes your firm as an authority.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/marketing?plan=marketing-basic">
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