import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Navbar />
          
          <div className="max-w-4xl mx-auto mt-10">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
              <p className="text-muted-foreground">Last Updated: April {currentYear}</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm mb-8">
              <div className="flex items-center mb-4 border-b border-border pb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Important Notice</h2>
                  <p className="text-sm text-muted-foreground">These Terms of Service constitute a legally binding agreement. Please read them carefully.</p>
                </div>
              </div>
              <p className="text-sm">
                By accessing or using FA Axis, you agree to these terms. Our service provides financial advisors with tools to analyze transition opportunities but does not constitute financial advice. We provide estimates based on available data, but actual offers may vary. Premium subscriptions automatically renew until canceled.
              </p>
            </div>
            
            <div className="text-foreground dark:text-white max-w-none space-y-6">
              <h2 id="agreement" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">1. Agreement to Terms</h2>
              <p>
                By accessing or using FA Axis (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of the Terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access or use the Service. By accessing or using the Service, you agree to be bound by these Terms. If you are using the Service on behalf of a company or other legal entity, you represent that you have the authority to bind such entity to these Terms.
              </p>
              
              <h2 id="service-description" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">2. Description of Service</h2>
              <p>
                FA Axis provides a platform for financial advisors to calculate, analyze, and compare transition packages and compensation structures across various financial firms. Our services include but are not limited to:
              </p>
              <ul>
                <li><strong>Compensation analysis tools</strong>: Calculate potential transition packages, grid rates, and long-term compensation projections</li>
                <li><strong>Firm comparison features</strong>: Compare offers and compensation structures across multiple firms</li>
                <li><strong>Market data</strong>: Access industry information, firm profiles, and current recruiting trends</li>
                <li><strong>Data visualization</strong>: Interactive charts and graphs to illustrate compensation scenarios</li>
                <li><strong>Scenario saving</strong>: Save, manage, and export calculation scenarios (Premium subscribers)</li>
                <li><strong>Educational resources</strong>: Articles, guides, and resources related to advisor transitions</li>
              </ul>
              <p>
                The Service is continually evolving, and we reserve the right to add, modify, or remove features at any time, with or without notice.
              </p>
              
              <h2 id="eligibility" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">3. Eligibility</h2>
              <p>
                You must be at least 18 years old and a financial services professional to use the Service. By using the Service, you represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are at least 18 years of age</li>
                <li>You are a financial services professional or otherwise have a legitimate business interest in using our calculator</li>
                <li>You have the legal capacity to enter into these Terms</li>
                <li>Your use of the Service will not violate any applicable law, regulation, or obligation</li>
                <li>You will provide accurate and complete information when creating an account or using our services</li>
              </ul>
              
              <h2 id="user-accounts" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">4. User Accounts</h2>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms and may result in immediate termination of your account.
              </p>
              <p>
                You are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Safeguarding your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use of your account or any other security breach</li>
                <li>Ensuring that you exit from your account at the end of each session when accessing the Service on a shared computer</li>
              </ul>
              <p>
                We reserve the right to refuse service, terminate accounts, remove or edit content, or cancel subscriptions at our sole discretion.
              </p>
              
              <h2 id="subscription-tiers" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">5. Free and Premium Subscription Tiers</h2>
              <p>
                FA Axis offers different subscription tiers with varying features and capabilities:
              </p>
              <div className="not-prose my-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-border rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4">Free Access</h3>
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
                        <span>Access to blog and educational resources</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border border-primary rounded-lg p-6 bg-primary/5">
                    <h3 className="text-xl font-semibold mb-4">Premium Subscription</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Advanced compensation calculator with detailed projections</span>
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
                        <span>Customizable parameters and assumptions</span>
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
                        <span>Export results and reports</span>
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
              <p>
                Premium subscriptions are priced at $99 per month or $899 per year (approximately 25% savings). Pricing is subject to change with notice to subscribers.
              </p>
              
              <h2 id="payments" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">6. Payments and Billing</h2>
              <p>
                By subscribing to our Premium service, you agree to the following payment terms:
              </p>
              <ul>
                <li><strong>Automatic Renewal</strong>: Subscriptions automatically renew at the end of each billing period (monthly or annual) unless canceled before the renewal date.</li>
                <li><strong>Payment Methods</strong>: We accept major credit cards and other payment methods as indicated on our website. You must provide accurate and complete billing information.</li>
                <li><strong>Price Changes</strong>: We may change subscription prices with at least 30 days' notice before changes take effect. The notice will be sent to the email address associated with your account.</li>
                <li><strong>Taxes</strong>: Prices shown do not include applicable taxes. Any tax obligations are your responsibility.</li>
              </ul>
              
              <h3 id="cancellation" className="scroll-mt-20 text-xl font-semibold mb-3 mt-6">6.1 Cancellation and Refund Policy</h3>
              <p>
                You may cancel your subscription at any time from your account dashboard. Upon cancellation:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Monthly subscriptions will remain active until the end of the current billing period, then automatically terminate</li>
                <li>Annual subscriptions will remain active until the end of the annual term, then automatically terminate</li>
                <li>We do not provide refunds for partial subscription periods or unused portions of your subscription</li>
                <li>We may offer refunds in exceptional circumstances at our sole discretion</li>
              </ul>
              
              <h2 id="intellectual-property" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">7. Intellectual Property Rights</h2>
              <p>
                The Service and all of its original content, features, calculations, algorithms, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are and will remain the exclusive property of FA Axis and its licensors.
              </p>
              <p>
                Our trademarks, service marks, designs, logos, and trade dress may not be used without our prior written permission. The Service is protected by copyright, trademark, and other laws of the United States and foreign countries.
              </p>
              <p>
                You may not:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Copy, modify, or distribute our content</li>
                <li>Attempt to reverse engineer our software or algorithms</li>
                <li>Remove any copyright or proprietary notices</li>
                <li>Transfer, sell, license, or assign your account or any Service rights</li>
                <li>Scrape, data mine, or attempt to access our code or proprietary information</li>
              </ul>
              
              <h2 id="user-data" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">8. User Content and Data</h2>
              <p>
                When you input information into our Service, you retain ownership of your data. By providing content to our Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and process your data as necessary to provide and improve the Service.
              </p>
              <p>
                We may use aggregated, anonymized data derived from user inputs for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Research and development of new features</li>
                <li>Improving our calculation algorithms</li>
                <li>Creating industry benchmarks and insights</li>
                <li>Marketing our services (without revealing individual data)</li>
              </ul>
              <p>
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The information you provide is accurate and up-to-date</li>
                <li>You have the right to provide this information to our Service</li>
                <li>Your use of the Service does not violate any applicable laws or regulations</li>
              </ul>
              
              <h2 id="disclaimer" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">9. Disclaimers and Limitations</h2>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-6 my-4">
                <h3 className="text-amber-800 dark:text-amber-400 font-semibold mb-2">Important Disclaimer</h3>
                <p className="text-amber-700 dark:text-amber-300 text-base">
                  FA Axis provides estimates and projections based on available data and industry knowledge. We are not a brokerage firm, financial advisor, or transition consultant. Our Service should be used as one of several tools in your decision-making process.
                </p>
              </div>
              <p>
                You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Estimates Only</strong>: All calculations provided are estimates and projections that may differ from actual offers</li>
                <li><strong>Not Financial Advice</strong>: Our Service does not constitute financial, investment, legal, or tax advice</li>
                <li><strong>Market Changes</strong>: Firm policies, offers, and market conditions change regularly and may not be reflected immediately in our calculations</li>
                <li><strong>Individual Factors</strong>: Your specific circumstances, negotiation skills, and relationships may significantly affect actual transition offers</li>
                <li><strong>Independent Verification</strong>: You should independently verify all information with potential firms</li>
              </ul>
              <p>
                You accept sole responsibility for any decisions or actions taken based on our calculations or information.
              </p>
              
              <h2 id="liability" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">10. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, FA Axis and its directors, employees, partners, agents, suppliers, or affiliates shall not be liable for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, goodwill, or other intangible losses</li>
                <li>Any damages related to your access to, use of, or inability to access or use the Service</li>
                <li>Any business decisions made based on calculations or projections provided by the Service</li>
                <li>Any unauthorized access to or use of our servers and/or personal information stored therein</li>
                <li>Any interruption or cessation of transmission to or from the Service</li>
              </ul>
              <p>
                In no event shall our total liability to you for all claims exceed the amount you paid to us during the twelve (12) months preceding the event giving rise to the liability, or one hundred dollars ($100) if you have not had any payment obligations to us.
              </p>
              
              <h2 id="indemnification" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">11. Indemnification</h2>
              <p>
                You agree to defend, indemnify, and hold harmless FA Axis and its licensors, service providers, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your violation of these Terms</li>
                <li>Your use of the Service, including any data or content submitted or provided by you</li>
                <li>Any decisions or actions taken by you or third parties based on calculations or information provided by the Service</li>
              </ul>
              
              <h2 id="governing-law" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">12. Governing Law and Jurisdiction</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the State of New York, without regard to its conflict of law provisions. You agree that any legal action, suit, or proceeding arising out of or relating to these Terms or your use of the Service shall be instituted exclusively in the federal or state courts located in New York County, New York.
              </p>
              <p>
                Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability for certain types of damages. If any disclaimer, waiver, or limitation of liability is found to be invalid or unenforceable, the invalid or unenforceable provision will be deemed modified to the minimum extent necessary to make it valid and enforceable.
              </p>
              
              <h2 id="term-termination" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">13. Term and Termination</h2>
              <p>
                These Terms shall remain in full force and effect while you use the Service. We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
              <p>
                The following provisions of the Terms survive termination: ownership provisions, warranty disclaimers, indemnity, limitations of liability, and governing law provisions.
              </p>
              
              <h2 id="changes-terms" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">14. Changes to Terms</h2>
              <p>
                We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. We will determine what constitutes a material change in our sole discretion.
              </p>
              <p>
                By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised Terms. If you do not agree to the new Terms, you are no longer authorized to use the Service.
              </p>
              
              <h2 id="miscellaneous" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">15. Miscellaneous</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Entire Agreement</strong>: These Terms constitute the entire agreement between you and FA Axis regarding the Service.</li>
                <li><strong>Waiver</strong>: Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.</li>
                <li><strong>Severability</strong>: If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions will remain in effect.</li>
                <li><strong>Assignment</strong>: You may not assign or transfer these Terms or your rights under these Terms without our prior written consent. We may assign our rights and obligations under these Terms without your consent.</li>
                <li><strong>Force Majeure</strong>: We will not be liable for any failure or delay in performance resulting from causes beyond our reasonable control.</li>
              </ul>
              
              <h2 id="contact-us" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">16. Contact Us</h2>
              <p>
                If you have any questions, concerns, or feedback about these Terms, please contact us through any of the following channels:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 mt-4">
                <p>
                  <strong className="text-foreground">Email:</strong> <a href="mailto:terms@faaxis.com" className="text-primary hover:underline">terms@faaxis.com</a><br />
                  <strong className="text-foreground">Mail:</strong> FA Axis Legal Department<br />
                  123 Financial Plaza<br />
                  New York, NY 10001<br />
                  <strong className="text-foreground">Phone:</strong> (212) 555-0123
                </p>
              </div>
            </div>
            
            <div className="mt-12 mb-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <a href="#agreement" className="text-primary hover:underline">1. Agreement to Terms</a>
                  <a href="#service-description" className="text-primary hover:underline">2. Description of Service</a>
                  <a href="#eligibility" className="text-primary hover:underline">3. Eligibility</a>
                  <a href="#user-accounts" className="text-primary hover:underline">4. User Accounts</a>
                  <a href="#subscription-tiers" className="text-primary hover:underline">5. Free and Premium Subscription Tiers</a>
                  <a href="#payments" className="text-primary hover:underline">6. Payments and Billing</a>
                  <a href="#cancellation" className="text-primary hover:underline ml-4">6.1 Cancellation and Refund Policy</a>
                  <a href="#intellectual-property" className="text-primary hover:underline">7. Intellectual Property Rights</a>
                  <a href="#user-data" className="text-primary hover:underline">8. User Content and Data</a>
                  <a href="#disclaimer" className="text-primary hover:underline">9. Disclaimers and Limitations</a>
                  <a href="#liability" className="text-primary hover:underline">10. Limitation of Liability</a>
                  <a href="#indemnification" className="text-primary hover:underline">11. Indemnification</a>
                  <a href="#governing-law" className="text-primary hover:underline">12. Governing Law and Jurisdiction</a>
                  <a href="#term-termination" className="text-primary hover:underline">13. Term and Termination</a>
                  <a href="#changes-terms" className="text-primary hover:underline">14. Changes to Terms</a>
                  <a href="#miscellaneous" className="text-primary hover:underline">15. Miscellaneous</a>
                  <a href="#contact-us" className="text-primary hover:underline">16. Contact Us</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}