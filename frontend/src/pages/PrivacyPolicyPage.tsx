import React from 'react';
import { Link } from 'react-router-dom';

// Privacy Policy page for NexFuga
// Renders static legal content provided by the business with accessible, readable layout
const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 2025</p>
        </header>

        {/* Disclaimer */}
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 mb-8">
          <p className="text-sm text-amber-900">
            <strong>Disclaimer:</strong> In case of any discrepancy or difference, the English version will take precedence over any translation.
          </p>
        </div>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p>
            At <strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong> ("<strong>NexFuga</strong>", "<strong>we</strong>", "<strong>our</strong>", "<strong>us</strong>"), we value the trust you place in us and recognize the importance of secure transactions and information privacy. This Privacy Policy describes how we collect, use, share, and otherwise process your personal data through our website <a href="https://www.nexfuga.com" target="_blank" rel="noopener noreferrer">www.nexfuga.com</a>, its mobile application, and related digital platforms (collectively referred to as the "<strong>Platform</strong>").
          </p>
          <p>
            By visiting or using our Platform, you agree to be bound by this Privacy Policy, our Terms of Use, and applicable product/service terms and conditions, and to be governed by the laws of India, including those applicable to data protection and privacy. If you do not agree, please do not use or access our Platform.
          </p>
        </section>

        {/* 1. Collection */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">1. Collection of Your Information</h2>
          <p className="mt-2 text-gray-700">When you use our Platform, we collect and store information you provide from time to time. Once you provide personal data, you are not anonymous to us.</p>
          <ul className="list-disc pl-6 mt-4 space-y-1 text-gray-700">
            <li>
              <strong>Personal Information:</strong> Name, email address, delivery/billing address, phone number, payment details (credit/debit card, UPI, net banking), GST details, government-issued IDs, or other KYC details (where applicable).
            </li>
            <li>
              <strong>Behavioral & Technical Information:</strong> Browsing patterns, preferences, IP address, device type, operating system, browser type, and URL data (referring or exit pages).
            </li>
            <li>
              <strong>Transactional Information:</strong> Details of orders placed, payments made, invoices, and after-sales interactions.
            </li>
            <li>
              <strong>Optional Data:</strong> Feedback, survey responses, lifestyle/demographic information, or participation in events/contests.
            </li>
          </ul>
          <p className="mt-2 text-gray-700">If you communicate with us (emails, letters, chat support, or social media), we may store such correspondence in your customer file.</p>
        </section>

        {/* 2. Use */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">2. Use of Your Information</h2>
          <p className="mt-2 text-gray-700">We use your personal data to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Process and fulfill orders, deliver products, and provide services.</li>
            <li>Communicate about transactions, products, services, and promotional offers.</li>
            <li>Improve user experience, enhance security, and personalize recommendations.</li>
            <li>Conduct internal research, market analysis, and customer behavior studies.</li>
            <li>Enable business partners, payment providers, logistics partners, and service providers to serve you better.</li>
            <li>Detect, prevent, and investigate fraud, illegal activities, or misuse of our Platform.</li>
            <li>Comply with applicable legal obligations, tax laws, and regulatory requirements.</li>
          </ul>
          <p className="mt-2 text-gray-700">
            With your consent, we may also access device features (camera, gallery, SMS, contacts, or location) to facilitate services such as digital payments, KYC verification, or product personalization.
          </p>
        </section>

        {/* 3. Cookies */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">3. Cookies</h2>
          <p className="mt-2 text-gray-700">We use cookies and similar technologies to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Enhance Platform functionality and security.</li>
            <li>Remember login sessions and preferences.</li>
            <li>Measure traffic patterns, user engagement, and promotional effectiveness.</li>
            <li>Deliver personalized recommendations and advertisements.</li>
          </ul>
          <p className="mt-2 text-gray-700">You may manage cookies via your browser settings. However, disabling cookies may limit some Platform features.</p>
        </section>

        {/* 4. Sharing */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">4. Sharing of Personal Data</h2>
          <p className="mt-2 text-gray-700">We may share your information with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>NexFuga group companies, affiliates, and related parties for providing products, services, and support.</li>
            <li>Business partners, payment gateways, logistics providers, and service vendors for order processing and fulfillment.</li>
            <li>Regulatory authorities, law enforcement agencies, or government bodies where required by law.</li>
            <li>Credit bureaus and financial institutions for credit checks, fraud detection, or financial product offerings.</li>
            <li>Third-party marketing and analytics partners for customer engagement and service personalization.</li>
          </ul>
          <p className="mt-2 text-gray-700">
            In the event of a merger, acquisition, restructuring, or business transfer, your data may be shared with the new entity, which will continue to honor this Privacy Policy.
          </p>
        </section>

        {/* 5. Security */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">5. Security Precautions</h2>
          <p className="mt-2 text-gray-700">
            We maintain reasonable physical, electronic, and procedural safeguards to protect your information. While we strive to ensure secure transmission and storage, no method of data transfer over the internet is 100% secure. You are responsible for protecting your account login and password.
          </p>
        </section>

        {/* 6. Opt-Out */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">6. Choice/Opt-Out</h2>
          <p className="mt-2 text-gray-700">
            You may opt out of promotional or marketing communications anytime by visiting our communication preference page or by using the "unsubscribe" option in our emails.
          </p>
        </section>

        {/* 7. Ads */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">7. Advertisements</h2>
          <p className="mt-2 text-gray-700">
            We may display third-party advertisements on our Platform. These partners may collect non-identifiable information about your visits to deliver personalized ads. You may opt out of ad personalization through your device settings.
          </p>
        </section>

        {/* 8. Children */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">8. Children’s Information</h2>
          <p className="mt-2 text-gray-700">
            Our Platform is intended for use by individuals above 18 years of age. We do not knowingly collect personal data from children under 18. If you provide such information, you represent that you are authorized to do so.
          </p>
        </section>

        {/* 9. Retention */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">9. Data Retention</h2>
          <p className="mt-2 text-gray-700">
            We retain personal data as long as necessary for the purposes stated in this Privacy Policy, or as required by law. Even after deletion, anonymized data may be retained for research, compliance, or fraud prevention.
          </p>
        </section>

        {/* 10. Rights */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">10. Your Rights</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Access, update, or correct your information through your account settings.</li>
            <li>Request deletion of non-mandatory personal data.</li>
            <li>Withdraw consent by contacting us (withdrawal may limit service access).</li>
          </ul>
          <p className="mt-2 text-gray-700">We will verify all such requests before acting.</p>
        </section>

        {/* 11. Consent */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">11. Your Consent</h2>
          <p className="mt-2 text-gray-700">
            By using our Platform, you consent to the collection, processing, storage, and disclosure of your personal data in accordance with this Privacy Policy.
          </p>
        </section>

        {/* 12. Changes */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">12. Changes to This Policy</h2>
          <p className="mt-2 text-gray-700">
            We may update this Privacy Policy periodically. Please review it regularly. Significant changes will be notified via email, Platform notice, or other lawful communication channels.
          </p>
        </section>

        {/* 13. Grievance Officer */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">13. Grievance Officer</h2>
          <div className="mt-2 text-gray-700 space-y-1">
            <p><strong>Name:</strong> Saksham Yadav</p>
            <p><strong>Designation:</strong> Senior Manager – Compliance & Privacy</p>
            <p><strong>Company:</strong> NEXT TECH FUSION GADGETS PRIVATE LIMITED</p>
            <p><strong>Headquarters:</strong> Jabalpur, Madhya Pradesh, India</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:privacy@nexfuga.com" className="text-blue-600 hover:underline">privacy@nexfuga.com</a>
            </p>
          </div>
        </section>

        {/* 14. Customer Support */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">14. Customer Support</h2>
          <div className="mt-2 text-gray-700 space-y-1">
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:support@nexfuga.com" className="text-blue-600 hover:underline">support@nexfuga.com</a>
            </p>
            <p>
              <strong>Help Center:</strong>{' '}
              <a href="https://www.nexfuga.com/help" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.nexfuga.com/help</a>
            </p>
          </div>
        </section>

        {/* Footer links hint */}
        <div className="mt-12">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;