import React from 'react';
import { Link } from 'react-router-dom';

// Terms of Service page for NexFuga
// Renders static legal content with accessible, readable layout
const TermsOfServicePage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">Last updated: September 9, 2025</p>
        </header>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p>
            Welcome to <strong>nexfuga.com</strong> ("<strong>Website</strong>"), owned and operated by
            <strong> NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong> ("<strong>NexFuga</strong>", "<strong>Company</strong>", "<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>"), incorporated in the year 2025 and headquartered in Jabalpur, Madhya Pradesh, India.
          </p>
          <p>
            By accessing or using this Website, purchasing products, or availing services offered by NexFuga, you ("<strong>User</strong>", "<strong>you</strong>", or "<strong>your</strong>") agree to be bound by these Terms of Use ("<strong>Terms</strong>"), the Privacy Policy, and any other policies that may be posted on the Website from time to time. If you do not agree, please do not use this Website.
          </p>
        </section>

        {/* 1. Eligibility */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">1. Eligibility</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>You must be at least 18 years of age and capable of entering into legally binding contracts under Indian law.</li>
            <li>If you are accessing the Website on behalf of a company or other legal entity, you represent that you are authorized to bind that entity to these Terms.</li>
          </ul>
        </section>

        {/* 2. Account Registration */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">2. Account Registration</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>To access certain features, you may need to register and create an account with accurate details.</li>
            <li>You are solely responsible for maintaining confidentiality of your login credentials and for all activities under your account.</li>
            <li>NexFuga reserves the right to suspend or terminate accounts that provide false, misleading, or incomplete information.</li>
          </ul>
        </section>

        {/* 3. Products & Services */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">3. Products & Services</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>NexFuga is engaged in the wholesale distribution of advanced commercial technology equipment, peripherals, connectivity devices, and next-generation digital tools.</li>
            <li>All product descriptions, specifications, and prices are subject to change without prior notice.</li>
            <li>Availability of products is not guaranteed. Orders may be declined or canceled if items are unavailable, mispriced, or restricted by law.</li>
          </ul>
        </section>

        {/* 4. Pricing & Payment */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">4. Pricing & Payment</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Prices listed on the Website are in Indian Rupees (INR) unless otherwise stated.</li>
            <li>Payments must be made through the authorized payment gateways available on the Website.</li>
            <li>NexFuga reserves the right to cancel any order in case of payment failure, fraud detection, or pricing errors.</li>
          </ul>
        </section>

        {/* 5. User Responsibilities */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">5. User Responsibilities</h2>
          <p className="mt-2 text-gray-700">You agree not to use the Website for unlawful purposes, including but not limited to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Uploading false, harmful, or infringing content</li>
            <li>Engaging in fraudulent transactions</li>
            <li>Violating intellectual property rights</li>
            <li>Attempting unauthorized access to systems or networks</li>
          </ul>
          <p className="mt-2 text-gray-700">Any misuse may result in suspension, termination, or legal action.</p>
        </section>

        {/* 6. Intellectual Property */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">6. Intellectual Property</h2>
          <p className="mt-2 text-gray-700">
            All content on this Website, including text, graphics, logos, designs, product listings, software, and trademarks, are the intellectual property of NexFuga or its licensors. You may not copy, distribute, modify, or use any content without prior written consent from NexFuga.
          </p>
        </section>

        {/* 7. Third-Party Links & Services */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">7. Third-Party Links & Services</h2>
          <p className="mt-2 text-gray-700">
            The Website may contain links to third-party websites. NexFuga is not responsible for the content, services, or policies of such external sites. Transactions or communications with third parties are solely between you and the third party.
          </p>
        </section>

        {/* 8. Warranties & Disclaimers */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">8. Warranties & Disclaimers</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>NexFuga provides products “as is” without warranties of any kind, unless expressly stated in writing.</li>
            <li>We do not guarantee uninterrupted, error-free, or secure access to the Website.</li>
            <li>To the maximum extent permitted by law, NexFuga disclaims all warranties, express or implied.</li>
          </ul>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">9. Limitation of Liability</h2>
          <p className="mt-2 text-gray-700">
            NexFuga shall not be liable for any indirect, incidental, special, or consequential damages, including but not limited to loss of profits, data, goodwill, or business opportunities. Our total liability for any claim shall not exceed the amount paid by you for the product or service in question.
          </p>
        </section>

        {/* 10. Termination */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">10. Termination</h2>
          <p className="mt-2 text-gray-700">
            NexFuga may suspend or terminate your access to the Website without notice if you violate these Terms or applicable laws. Upon termination, your right to use the Website shall cease immediately.
          </p>
        </section>

        {/* 11. Governing Law & Dispute Resolution */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">11. Governing Law & Dispute Resolution</h2>
          <p className="mt-2 text-gray-700">
            These Terms shall be governed by and construed under the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh.
          </p>
        </section>

        {/* 12. Amendments */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">12. Amendments</h2>
          <p className="mt-2 text-gray-700">
            NexFuga reserves the right to modify, update, or amend these Terms at any time without prior notice. Continued use of the Website constitutes acceptance of the revised Terms.
          </p>
        </section>

        {/* 13. Contact & Grievance Officer */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">13. Contact & Grievance Officer</h2>
          <div className="mt-2 text-gray-700 space-y-1">
            <p><strong>Grievance Officer</strong></p>
            <p><strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong></p>
            <p>Jabalpur, Madhya Pradesh, India</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:saksham1508@gmail.com" className="text-blue-600 hover:underline">saksham1508@gmail.com</a>
            </p>
            <p>
              <strong>Phone:</strong> 8839825442
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

export default TermsOfServicePage;