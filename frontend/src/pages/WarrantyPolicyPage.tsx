import React from 'react';
import { Link } from 'react-router-dom';

// Warranty & Product Guarantee Policy page for NexFuga
// Renders static legal content provided by the business with accessible, readable layout
const WarrantyPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Warranty & Product Guarantee Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 9, 2025</p>
        </header>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p>
            This Warranty & Product Guarantee Policy ("<strong>Policy</strong>") applies to products purchased from
            <strong> nexfuga.com</strong> ("<strong>Website</strong>"), owned and operated by
            <strong> NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong> ("<strong>NexFuga</strong>", "<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>").
            By purchasing our products, you ("<strong>User</strong>", "<strong>you</strong>", or "<strong>your</strong>") agree to the terms below.
          </p>
        </section>

        {/* 1. Standard Warranty Coverage */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">1. Standard Warranty Coverage</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>All products sold by NexFuga come with a limited warranty against manufacturing defects, subject to the terms outlined below.</li>
            <li>
              Warranty duration may vary depending on the product category and will be specified:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>On the product page of the Website, or</li>
                <li>On the product invoice, or</li>
                <li>In the manufacturer’s warranty card (if applicable).</li>
              </ul>
            </li>
            <li>Unless otherwise stated, the standard warranty period is 12 months from the date of delivery.</li>
          </ul>
        </section>

        {/* 2. Warranty Exclusions */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">2. Warranty Exclusions</h2>
          <p className="mt-2 text-gray-700">The warranty does not cover:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Damage caused by misuse, negligence, accidents, fire, liquid, or power fluctuations.</li>
            <li>Normal wear and tear, scratches, or cosmetic damages.</li>
            <li>Unauthorized modifications, repairs, or use of incompatible accessories.</li>
            <li>Issues arising due to improper installation or handling not in accordance with product guidelines.</li>
            <li>Consumable items (such as cables, batteries, adapters, or accessories) unless specifically mentioned.</li>
          </ul>
        </section>

        {/* 3. Warranty Claim Procedure */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">3. Warranty Claim Procedure</h2>
          <p className="mt-2 text-gray-700">To initiate a warranty claim:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Contact our Customer Support within the warranty period.</li>
            <li>Provide the invoice/order ID and details of the defect.</li>
            <li>Ship the product securely to the service address provided by NexFuga.</li>
            <li>Our technical team will inspect the product to verify the defect.</li>
          </ul>
        </section>

        {/* 4. Resolution Options */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">4. Resolution Options</h2>
          <p className="mt-2 text-gray-700">If the product is found to have a genuine manufacturing defect under warranty, NexFuga will:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Repair the product free of charge, or</li>
            <li>Replace it with the same or equivalent model (subject to availability), or</li>
            <li>Offer a refund/credit note if repair or replacement is not feasible.</li>
          </ul>
        </section>

        {/* 5. Shipping Costs for Warranty Claims */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">5. Shipping Costs for Warranty Claims</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>If the defect is covered under warranty, NexFuga will bear the return shipping costs.</li>
            <li>If the defect is not covered, shipping and handling charges will be the responsibility of the customer.</li>
          </ul>
        </section>

        {/* 6. Limitation of Liability */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">6. Limitation of Liability</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>NexFuga’s liability under this Policy is strictly limited to the repair, replacement, or refund as stated above.</li>
            <li>We shall not be liable for any indirect, incidental, or consequential damages such as loss of business, data, or profits.</li>
          </ul>
        </section>

        {/* 7. Governing Law */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">7. Governing Law</h2>
          <p className="mt-2 text-gray-700">
            This Policy shall be governed by and construed under the laws of India. Disputes shall be subject to the exclusive jurisdiction of the courts in Jabalpur, Madhya Pradesh.
          </p>
        </section>

        {/* 8. Contact for Warranty Support */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">8. Contact for Warranty Support</h2>
          <div className="mt-2 text-gray-700 space-y-1">
            <p><strong>Customer Support / Grievance Officer</strong></p>
            <p><strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong></p>
            <p>Jabalpur, Madhya Pradesh, India</p>
            <p>
              <strong>Email:</strong>{' '}
              <a href="mailto:saksham1508@gmail.com" className="text-blue-600 hover:underline">saksham1508@gmail.com</a>
            </p>
            <p>
              <strong>Phone:</strong> +91 8839825442
            </p>
          </div>
        </section>

        {/* Footer link */}
        <div className="mt-12">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPolicyPage;