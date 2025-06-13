import { StarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { AuthNavbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useRef, useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

// Reviews data with city and state
const reviews = [
  {
    name: "Michael",
    location: "Boston, MA",
    text: "The Google Ads campaign managed by FinancialAXIS transformed my practice. I'm now connecting with high-net-worth clients who specifically need my expertise in retirement planning."
  },
  {
    name: "Jennifer",
    location: "Chicago, IL",
    text: "Their social media management has completely removed the content creation burden from my shoulders. Compliance-approved posts are consistently published, and my LinkedIn presence has never been stronger."
  },
  {
    name: "Robert",
    location: "Austin, TX",
    text: "The website design team at FinancialAXIS delivered a beautiful, modern site that perfectly represents my brand. The lead generation forms are bringing in qualified prospects every week."
  },
  {
    name: "Sarah",
    location: "Seattle, WA",
    text: "I've tried other marketing companies before, but none understood the unique compliance requirements of our industry. FinancialAXIS gets it and delivers results without compliance headaches."
  },
  {
    name: "David",
    location: "Phoenix, AZ",
    text: "The cybersecurity assessment and implementation helped bring our practice up to regulatory standards. We now feel confident that our client data is properly protected."
  },
  {
    name: "Jessica",
    location: "Miami, FL",
    text: "The content marketing service has positioned me as a thought leader in my niche. The professionally written articles and guides have been instrumental in growing my client base."
  },
  {
    name: "Thomas",
    location: "Denver, CO",
    text: "Working with FinancialAXIS has been a game-changer for our practice. Their strategic approach to marketing has helped us connect with exactly the type of clients we want to serve."
  },
  {
    name: "Amanda",
    location: "Portland, OR",
    text: "The ROI on our Google Ads campaign has been exceptional. For every dollar we spend, we're seeing approximately $4 in new client revenue. Couldn't be happier with the results."
  },
  {
    name: "Christopher",
    location: "Nashville, TN",
    text: "The entire team at FinancialAXIS is responsive and knowledgeable. They respond quickly to any requests and consistently deliver quality work that exceeds expectations."
  },
  {
    name: "Emily",
    location: "San Diego, CA",
    text: "As a newly independent advisor, I needed to quickly establish a professional online presence. FinancialAXIS delivered a complete digital marketing package that made my transition seamless."
  },
  {
    name: "Daniel",
    location: "Charlotte, NC",
    text: "Our firm's website redesign exceeded expectations. The clean, professional design and intuitive navigation have generated numerous compliments from clients and prospects alike."
  },
  {
    name: "Olivia",
    location: "Minneapolis, MN",
    text: "The digital advertising strategy developed by FinancialAXIS helped us penetrate a new geographic market. We're now working with clients we couldn't have reached through traditional methods."
  },
  {
    name: "William",
    location: "Las Vegas, NV",
    text: "The email newsletter service has been incredibly effective at maintaining relationships with existing clients while providing valuable content that gets shared with their friends and family."
  },
  {
    name: "Sophia",
    location: "Atlanta, GA",
    text: "I appreciate how FinancialAXIS takes the time to understand my unique value proposition. They've created marketing materials that authentically represent who I am and the services I provide."
  },
  {
    name: "James",
    location: "Kansas City, MO",
    text: "The marketing consultation provided clarity on where to focus our limited resources. Their data-driven approach helped us identify the most effective channels for our specific practice."
  },
  {
    name: "Elizabeth",
    location: "Philadelphia, PA",
    text: "I've been working with FinancialAXIS for over two years, and the consistent lead flow has allowed us to be more selective with the clients we take on, increasing our average AUM per client."
  },
  {
    name: "Richard",
    location: "Columbus, OH",
    text: "The local SEO work done by FinancialAXIS has made our firm visible in local searches. We're now showing up for important keywords right when people are looking for financial advice."
  },
  {
    name: "Margaret",
    location: "San Antonio, TX",
    text: "What I appreciate most is the transparency in reporting. Monthly performance reviews show exactly what's working and where adjustments are needed. No smoke and mirrors, just results."
  },
  {
    name: "Joseph",
    location: "Jacksonville, FL",
    text: "The webinar series FinancialAXIS helped us create and promote has been our most effective lead generation tool. Each session brings in dozens of qualified prospects."
  },
  {
    name: "Charlotte",
    location: "Detroit, MI",
    text: "As someone who was skeptical of digital marketing, I'm now a believer. The targeted approach and industry knowledge FinancialAXIS brings has made all the difference for our practice."
  },
  {
    name: "Andrew",
    location: "Raleigh, NC",
    text: "The custom landing pages created for our specialized services have dramatically improved our conversion rates. The clear messaging and strong calls-to-action are working beautifully."
  },
  {
    name: "Nicole",
    location: "Cleveland, OH",
    text: "Working with FinancialAXIS has given us more time to focus on serving clients instead of figuring out marketing. Outsourcing to experts who understand our industry has been worth every penny."
  },
  {
    name: "Brian",
    location: "Pittsburgh, PA",
    text: "The client portal design and implementation has improved client satisfaction and retention. Clients love the easy access to their documents and performance reports."
  },
  {
    name: "Laura",
    location: "St. Louis, MO",
    text: "The branding package developed by FinancialAXIS gave our firm a cohesive, professional look across all touchpoints. Our materials now reflect the premium service we provide."
  },
  {
    name: "Kevin",
    location: "Richmond, VA",
    text: "I appreciate how FinancialAXIS stays on top of industry trends and regulatory changes. Their forward-thinking approach ensures our marketing always remains compliant and effective."
  },
  {
    name: "Rachel",
    location: "Omaha, NE",
    text: "The competitive analysis provided valuable insights into how we can differentiate our practice. The strategic recommendations have helped us carve out a unique position in our market."
  },
  {
    name: "Patrick",
    location: "Tucson, AZ",
    text: "Their professional photography and video services have elevated our online presence. The quality visuals have made a significant difference in how prospects perceive our firm."
  }
];

export default function ReviewsPage() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', containScroll: 'trimSnaps' });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);
  
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);
  
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);
  
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <AuthNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                <span className="bg-gradient-to-r from-primary via-secondary to-primary/70 bg-clip-text text-transparent">
                  Client Testimonials
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Hear directly from financial advisors who have experienced the benefits of our services.
              </p>
            </div>
          </div>
        </section>
        
        {/* Reviews Carousel */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="relative px-8">
              {/* Navigation buttons */}
              <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-4 md:-translate-x-6">
                <button 
                  onClick={scrollPrev} 
                  disabled={!prevBtnEnabled}
                  className="bg-background/80 backdrop-blur text-foreground hover:bg-muted p-3 rounded-full shadow-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </div>
              
              <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-4 md:translate-x-6">
                <button 
                  onClick={scrollNext} 
                  disabled={!nextBtnEnabled}
                  className="bg-background/80 backdrop-blur text-foreground hover:bg-muted p-3 rounded-full shadow-lg border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              {/* Carousel */}
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex">
                  {reviews.map((review, index) => (
                    <div key={index} className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] pl-4">
                      <div className="bg-card rounded-lg p-6 shadow-md border border-border hover:shadow-lg transition-shadow h-full flex flex-col">
                        <div className="flex items-center mb-4">
                          {Array(5).fill(0).map((_, i) => (
                            <StarIcon key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-0.5" />
                          ))}
                        </div>
                        <blockquote className="text-foreground mb-4 flex-grow">
                          "{review.text}"
                        </blockquote>
                        <footer>
                          <div className="font-medium">- {review.name}</div>
                          <div className="text-sm text-muted-foreground">{review.location}</div>
                        </footer>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Experience These Results?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the growing number of financial advisors who are transforming their practices with our specialized marketing services.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/marketing" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-6 rounded-full inline-flex items-center transition-all">
                Explore Our Services
              </a>
              <a href="#" className="bg-background hover:bg-muted border border-input font-medium py-3 px-6 rounded-full inline-flex items-center transition-all">
                Schedule a Consultation
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}