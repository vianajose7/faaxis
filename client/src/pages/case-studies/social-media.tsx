import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Footer } from "@/components/layout/footer";
import { Head } from "@/components/layout/head";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Share2, BarChart, Target, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function SocialMediaPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head 
        title="Social Media Case Study | FaAxis"
        description="Discover how our social media strategy generated a 4x increase in qualified leads for financial advisors."
        keywords="financial advisor social media, LinkedIn strategy, social media for wealth management, advisor marketing case study" 
      />
      <SimpleNavbar />
      
      <PageHeader
        title="Social Media Case Study"
        description="How we transformed a boutique wealth management firm's social presence and generated 4x more qualified leads"
      />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
                  Social Media Transformation
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  See how we helped a boutique wealth management firm go from nearly invisible on social media
                  to a respected thought leader with a consistent stream of high-quality leads.
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
                        <span>Irregular posting schedule with no content strategy</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Less than 200 LinkedIn followers with minimal engagement</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>No clear brand voice or visual identity</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <span className="text-destructive mt-1">✕</span>
                        <span>Zero leads directly attributed to social media</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-card rounded-lg shadow-lg p-6 relative z-20 border border-primary/20">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">After FaAxis</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Consistent content calendar with strategic thought leadership</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Over 2,500 LinkedIn followers with 6.8% engagement rate</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>Cohesive brand identity and authoritative industry voice</span>
                      </li>
                      <li className="flex items-start gap-2 text-muted-foreground">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>15-20 qualified leads per month from social channels</span>
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
                Through a comprehensive social media overhaul and consistent execution, we delivered 
                measurable results that far exceeded the firm's expectations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Share2 className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Engagement</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">+580%</h3>
                  <p className="text-muted-foreground">Increase in post engagement rate</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Leads</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">4x</h3>
                  <p className="text-muted-foreground">Increase in qualified lead generation</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg dark:bg-card/60 bg-card/80 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-10 w-10 text-primary" />
                    <span className="text-sm font-medium text-muted-foreground">Growth</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-1">1,150%</h3>
                  <p className="text-muted-foreground">LinkedIn follower growth in 12 months</p>
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
                  We crafted a comprehensive social media strategy to establish the firm as a thought leader 
                  and generate consistent, qualified leads.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <BarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Content Pillars Strategy</h3>
                      <p className="text-muted-foreground">
                        We developed four content pillars aligned with the firm's expertise: retirement planning, 
                        tax strategies, estate planning, and market insights – creating a balanced content calendar.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Executive Branding</h3>
                      <p className="text-muted-foreground">
                        We positioned the firm's partners as industry thought leaders through personal branding, 
                        guest appearances on podcasts, and contributed articles to industry publications.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg mt-1">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Lead Generation Focus</h3>
                      <p className="text-muted-foreground">
                        We created premium content offers (retirement readiness checklist, tax strategy guide) 
                        and implemented strategic CTAs to capture leads from engaged followers.
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
                    <Share2 className="h-16 w-16 text-primary/50 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">LinkedIn Engagement Growth</h3>
                    <p className="text-muted-foreground">
                      Visual representation of engagement metrics over 12 months
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
                "Social media was always an afterthought for our firm until we partnered with FaAxis. They transformed our approach completely and positioned us as genuine thought leaders in our space. The increase in quality leads has been remarkable."
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">Sarah Reynolds</p>
                <p className="text-muted-foreground">Partner, Summit Wealth Management</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="bg-card border rounded-xl p-8 md:p-12 shadow-lg">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Social Media Presence?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Let our team of social media strategists help you build an authoritative presence that generates consistent qualified leads.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/marketing?plan=marketing-premium">
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