import { SimpleNavbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="min-h-screen flex flex-col">
      <SimpleNavbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          
          <div className="max-w-4xl mx-auto mt-10">
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
              <p className="text-muted-foreground">Last Updated: April {currentYear}</p>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-8 shadow-sm mb-6">
              <div className="flex items-center mb-4 border-b border-border pb-4">
                <div className="bg-primary/10 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Summary of Key Points</h2>
                  <p className="text-sm text-muted-foreground">This summary provides key points from our privacy policy, but you should read the complete policy for full details.</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>We collect personal and professional information to provide financial advisor transition tools and services.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>Your financial data (AUM, revenue, etc.) is used only for calculations and is never sold to third parties.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>We use industry-standard security measures to protect your information.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>You have rights to access, correct, or delete your personal information.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary mr-2">•</span>
                  <span>We use cookies and similar technologies to enhance your browsing experience.</span>
                </li>
              </ul>
            </div>
            
            <div className="text-foreground dark:text-white max-w-none space-y-6">
              <h2 id="introduction" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">1. Introduction</h2>
              <p>
                At FA Axis ("we," "our," or "us"), we respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit our website and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
              <p>
                Our platform is designed for financial advisors looking to maximize their compensation packages during career transitions. We understand the sensitive nature of the financial information you share with us and treat it with the utmost confidentiality.
              </p>
              <p>
                This policy applies to information we collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>On our website and through our calculator tools</li>
                <li>In email, text, and other electronic messages between you and our platform</li>
                <li>Through mobile and desktop applications you download from our site</li>
                <li>When you interact with our advertising and applications on third-party websites and services</li>
              </ul>
              
              <h2 id="information-collected" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">2. Information We Collect</h2>
              <p>We collect several types of information from and about users of our website, including:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Personal identifiers</strong>: Name, email address, phone number, mailing address, and other contact information</li>
                <li><strong>Professional information</strong>: Assets under management (AUM), annual revenue, fee-based percentage, current firm affiliation, client composition, and other practice-specific data</li>
                <li><strong>Account information</strong>: Username, password, security questions, and account preferences</li>
                <li><strong>Payment details</strong>: Credit card information, billing address (for premium subscriptions), processed securely through our payment provider</li>
                <li><strong>Usage data</strong>: How you interact with our services, features you use, time spent on pages, calculation parameters entered</li>
                <li><strong>Technical information</strong>: IP address, browser type and version, operating system, device information, and browsing patterns</li>
                <li><strong>Communications</strong>: Records of your communications with us for customer service or other purposes</li>
              </ul>
              <p>
                We do <strong>not</strong> collect:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Your clients' personal information or financial details</li>
                <li>Social security numbers or government identification numbers</li>
                <li>Information about your individual investment holdings</li>
              </ul>
              
              <h2 id="collection-methods" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">3. How We Collect Your Information</h2>
              <p>We collect information:</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Directly from you</strong> when you:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Create an account or update your profile</li>
                    <li>Enter practice data into our calculators</li>
                    <li>Subscribe to premium services</li>
                    <li>Contact customer support</li>
                    <li>Respond to surveys or participate in promotions</li>
                  </ul>
                </li>
                <li><strong>Automatically</strong> as you navigate through the site:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Through cookies and similar tracking technologies</li>
                    <li>Server logs and analytics tools</li>
                    <li>User engagement and interaction data</li>
                    <li>Device and connection information</li>
                  </ul>
                </li>
                <li><strong>From third parties</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Authentication services (if you log in using single sign-on)</li>
                    <li>Payment processors (transaction information only)</li>
                    <li>Analytics and service providers</li>
                    <li>Business partners with your consent</li>
                  </ul>
                </li>
              </ul>
              
              <h3 id="cookies" className="scroll-mt-20 text-xl font-bold my-4">3.1 Cookies and Tracking Technologies</h3>
              <p>
                We use cookies, web beacons, pixels, and similar technologies to improve your experience on our platform. These technologies help us:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our services</li>
                <li>Enhance security and prevent fraud</li>
                <li>Analyze and improve our website performance</li>
                <li>Measure the effectiveness of our communications</li>
              </ul>
              <p>
                You can manage your cookie preferences through your browser settings. However, disabling certain cookies may limit your ability to use some features of our platform.
              </p>
              
              <h2 id="information-usage" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">4. How We Use Your Information</h2>
              <p>We use the information we collect for various purposes, including:</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Core Service Provision</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Calculate and present accurate compensation projections</li>
                    <li>Generate comparison reports across multiple firms</li>
                    <li>Save and manage your calculation scenarios (premium users)</li>
                    <li>Provide personalized recommendations based on your practice profile</li>
                  </ul>
                </li>
                <li><strong>Account Management</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Create and maintain your user account</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Authenticate you when you sign in</li>
                    <li>Respond to your support requests</li>
                  </ul>
                </li>
                <li><strong>Service Improvement</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Analyze usage patterns to enhance our tools</li>
                    <li>Develop new features and services</li>
                    <li>Fix bugs and troubleshoot issues</li>
                    <li>Conduct research to improve our compensation models</li>
                  </ul>
                </li>
                <li><strong>Communications</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Send important service updates and notices</li>
                    <li>Provide information about new features</li>
                    <li>Deliver educational content about transitions (with your consent)</li>
                    <li>Respond to your inquiries and requests</li>
                  </ul>
                </li>
              </ul>
              
              <h2 id="disclosure" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">5. Disclosure of Your Information</h2>
              <p>We may disclose aggregated, anonymized information about our users, which does not identify any individual, without restriction.</p>
              <p>We may disclose personal information that we collect or you provide:</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>To service providers</strong> that perform functions on our behalf, such as:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Hosting and cloud infrastructure providers</li>
                    <li>Payment processors for subscription management</li>
                    <li>Analytics services to help us understand user behavior</li>
                    <li>Email service providers for communications</li>
                    <li>Customer support tools to address your inquiries</li>
                  </ul>
                </li>
                <li><strong>For business transfers</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>If we are acquired by or merged with another company</li>
                    <li>If we sell or transfer part of our assets</li>
                    <li>During corporate restructuring, bankruptcy, or liquidation</li>
                  </ul>
                </li>
                <li><strong>For legal purposes</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>To comply with legal obligations</li>
                    <li>To enforce our terms of service</li>
                    <li>To protect our rights, privacy, safety, or property</li>
                    <li>To respond to valid legal requests from public authorities</li>
                  </ul>
                </li>
                <li><strong>With your consent</strong> or at your direction</li>
              </ul>
              <p>
                <strong>We do not sell your personal information</strong> to third parties. We do not use your financial data to market financial products to you, nor do we share your calculation results with financial firms without your explicit consent.
              </p>
              
              <h2 id="data-security" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">6. Data Security</h2>
              <p>
                We implement a variety of security measures to maintain the safety of your personal information, including:
              </p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>Technical safeguards</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Encryption of data transmission using SSL/TLS protocols</li>
                    <li>Secure storage of sensitive information using industry-standard methods</li>
                    <li>Firewalls, intrusion detection, and prevention systems</li>
                    <li>Regular security assessments and vulnerability testing</li>
                  </ul>
                </li>
                <li><strong>Organizational measures</strong>:
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>Employee access limitations based on need-to-know principles</li>
                    <li>Regular security training for our team</li>
                    <li>Vendor assessment and contractual safeguards</li>
                    <li>Incident response procedures</li>
                  </ul>
                </li>
              </ul>
              <p>
                Despite our efforts, no method of electronic transmission or storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Any transmission of personal information is at your own risk.
              </p>
              
              <h2 id="rights-choices" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">7. Your Rights and Choices</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Access</strong>: Request a copy of the personal information we hold about you</li>
                <li><strong>Correction</strong>: Update or correct inaccurate information</li>
                <li><strong>Deletion</strong>: Request erasure of your personal information</li>
                <li><strong>Restriction</strong>: Limit how we use your data in certain circumstances</li>
                <li><strong>Portability</strong>: Receive your information in a structured, commonly used format</li>
                <li><strong>Objection</strong>: Object to processing based on legitimate interests</li>
                <li><strong>Consent withdrawal</strong>: Withdraw consent for activities you previously consented to</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the details provided in the "Contact Us" section. We will respond to your request within the timeframe required by applicable law (typically 30 days). In certain cases, we may need to verify your identity before processing your request.
              </p>
              <p>
                You can also control many aspects of your information directly through your account settings:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Update your profile information</li>
                <li>Change your communication preferences</li>
                <li>Manage saved scenarios and calculations</li>
                <li>Delete your account (though some information may be retained as required by law)</li>
              </ul>
              
              <h2 id="childrens-privacy" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">8. Children's Privacy</h2>
              <p>
                Our services are designed for financial professionals and are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If we learn we have collected personal information from a child under 18, we will promptly delete that information.
              </p>
              <p>
                If you believe we might have any information from or about a child under 18, please contact us immediately using the information in the "Contact Us" section.
              </p>
              
              <h2 id="international-transfers" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">9. International Data Transfers</h2>
              <p>
                We primarily operate from the United States, but we may process, transfer, and store information about our users on servers located in various countries, including outside your country of residence. These countries may have data protection laws that differ from those in your country.
              </p>
              <p>
                By using our services, you consent to the transfer of your information to the United States and other countries where we and our service providers operate. We implement appropriate safeguards to ensure the protection of your information in accordance with this Privacy Policy, regardless of where it is processed.
              </p>
              
              <h2 id="policy-changes" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">10. Changes to Our Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time to reflect changes in our practices, services, or legal requirements. When we make material changes, we will:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Post a notice on our website</li>
                <li>Update the "Last Updated" date at the top of this policy</li>
                <li>Send you an email notification (for significant changes)</li>
              </ul>
              <p>
                Your continued use of our services after we post changes to the privacy policy constitutes your acceptance of those changes. We encourage you to review this privacy policy periodically to stay informed about how we collect, use, and protect your information.
              </p>
              
              <h2 id="contact-us" className="scroll-mt-20 text-2xl font-bold mb-4 mt-8">11. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests related to our privacy policy or your personal information, please contact us through any of the following channels:
              </p>
              <div className="bg-muted/30 p-6 rounded-lg border border-border/50 mt-4">
                <p>
                  <strong className="text-foreground">Email:</strong> <a href="mailto:privacy@faaxis.com" className="text-primary hover:underline">privacy@faaxis.com</a><br />
                  <strong className="text-foreground">Mail:</strong> FA Axis Privacy Team<br />
                  123 Financial Plaza<br />
                  New York, NY 10001<br />
                  <strong className="text-foreground">Phone:</strong> (212) 555-0123
                </p>
              </div>
              <p className="mt-6">
                We strive to respond to all inquiries within 30 days. For complex requests, we may need additional time and will keep you informed of our progress.
              </p>
            </div>
            
            <div className="mt-12 mb-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Table of Contents</h3>
                <ul className="space-y-2 grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <li>
                    <a href="#introduction" className="text-primary hover:underline">1. Introduction</a>
                  </li>
                  <li>
                    <a href="#information-collected" className="text-primary hover:underline">2. Information We Collect</a>
                  </li>
                  <li>
                    <a href="#collection-methods" className="text-primary hover:underline">3. How We Collect Your Information</a>
                  </li>
                  <li className="ml-4">
                    <a href="#cookies" className="text-primary hover:underline">3.1 Cookies and Tracking Technologies</a>
                  </li>
                  <li>
                    <a href="#information-usage" className="text-primary hover:underline">4. How We Use Your Information</a>
                  </li>
                  <li>
                    <a href="#disclosure" className="text-primary hover:underline">5. Disclosure of Your Information</a>
                  </li>
                  <li>
                    <a href="#data-security" className="text-primary hover:underline">6. Data Security</a>
                  </li>
                  <li>
                    <a href="#rights-choices" className="text-primary hover:underline">7. Your Rights and Choices</a>
                  </li>
                  <li>
                    <a href="#childrens-privacy" className="text-primary hover:underline">8. Children's Privacy</a>
                  </li>
                  <li>
                    <a href="#international-transfers" className="text-primary hover:underline">9. International Data Transfers</a>
                  </li>
                  <li>
                    <a href="#policy-changes" className="text-primary hover:underline">10. Changes to Our Privacy Policy</a>
                  </li>
                  <li>
                    <a href="#contact-us" className="text-primary hover:underline">11. Contact Us</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}