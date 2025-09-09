import React from 'react';
import { Link } from 'react-router-dom';

// Shipping & Delivery Policy page for NexFuga
// Renders static legal content provided by the business with accessible, readable layout
const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shipping & Delivery Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 9, 2025</p>
        </header>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p>
            This Shipping & Delivery Policy ("<strong>Policy</strong>") explains how <strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong>
            ("<strong>NexFuga</strong>", "<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>") manages the shipping and delivery of products
            purchased on <strong>nexfuga.com</strong> ("<strong>Website</strong>"). By placing an order, you ("<strong>User</strong>", "<strong>you</strong>", or "<strong>your</strong>") agree to the terms below.
          </p>
        </section>

        {/* 1. Shipping Coverage */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">1. Shipping Coverage</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>NexFuga currently delivers products across India.</li>
            <li>For international shipments, please contact our customer support team for availability and charges.</li>
          </ul>
        </section>

        {/* 2. Order Processing Time */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">2. Order Processing Time</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Orders are typically processed within 2–4 business days of confirmation, subject to product availability and payment clearance.</li>
            <li>Orders placed on weekends or public holidays will be processed on the next business day.</li>
          </ul>
        </section>

        {/* 3. Shipping Methods & Charges */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">3. Shipping Methods & Charges</h2>
          <p className="mt-2 text-gray-700">Shipping methods and charges vary depending on:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>The weight and dimensions of the product(s).</li>
            <li>Delivery location.</li>
            <li>Courier/logistics partner availability.</li>
          </ul>
          <p className="mt-2 text-gray-700">Applicable shipping fees will be displayed at checkout before you confirm your order.</p>
        </section>

        {/* 4. Estimated Delivery Time */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">4. Estimated Delivery Time</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Standard delivery within India usually takes 5–10 business days from the date of dispatch.</li>
            <li>For remote or hard-to-reach areas, delivery may take longer.</li>
            <li>NexFuga is not responsible for delays caused by courier services, customs (for international orders), or unforeseen circumstances such as strikes, natural disasters, or pandemics.</li>
          </ul>
        </section>

        {/* 5. Order Tracking */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">5. Order Tracking</h2>
          <p className="mt-2 text-gray-700">Once your order is shipped, you will receive a tracking ID and link via email/SMS to monitor the delivery status.</p>
        </section>

        {/* 6. Delivery Attempts */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">6. Delivery Attempts</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Our courier partners will attempt delivery at the provided address. If the delivery is unsuccessful after multiple attempts, the order may be returned to us.</li>
            <li>Re-shipping in such cases may incur additional charges.</li>
          </ul>
        </section>

        {/* 7. Inspection at Delivery */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">7. Inspection at Delivery</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>We strongly recommend that you inspect the package upon delivery.</li>
            <li>If the package is damaged, tampered, or incorrect, please reject the delivery and immediately contact our support team.</li>
          </ul>
        </section>

        {/* 8. Title & Risk of Loss */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">8. Title & Risk of Loss</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Ownership of products passes to you once the order is delivered and accepted at the shipping address.</li>
            <li>NexFuga is not responsible for loss or damage to products after successful delivery.</li>
          </ul>
        </section>

        {/* 9. Contact for Shipping Queries */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">9. Contact for Shipping Queries</h2>
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

export default ShippingPolicyPage;