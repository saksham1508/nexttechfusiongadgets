import React from 'react';
import { Link } from 'react-router-dom';

// Refunds, Returns & Cancellation Policy page for NexFuga
const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Refunds, Returns & Cancellation Policy</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 9, 2025</p>
        </header>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p>
            This Refunds, Returns & Cancellation Policy ("<strong>Policy</strong>") governs all orders placed on <strong>nexfuga.com</strong> ("<strong>Website</strong>"), owned and operated by <strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED</strong> ("<strong>NexFuga</strong>", "<strong>we</strong>", "<strong>our</strong>", or "<strong>us</strong>"). By purchasing products or services from the Website, you ("<strong>User</strong>", "<strong>you</strong>", or "<strong>your</strong>") agree to the terms of this Policy.
          </p>
        </section>

        {/* 1. Eligibility for Returns */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">1. Eligibility for Returns</h2>
          <p className="mt-2 text-gray-700">Products are eligible for return only if they are:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Delivered in a damaged or defective condition.</li>
            <li>Not matching the specifications or description listed on the Website.</li>
            <li>Incomplete in terms of accessories or components.</li>
          </ul>
          <p className="mt-2 text-gray-700">Returns must be requested within <strong>7 days</strong> of delivery.</p>
        </section>

        {/* 2. Conditions for Returns */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">2. Conditions for Returns</h2>
          <p className="mt-2 text-gray-700">
            Products must be unused, undamaged, and returned in their original packaging with all accessories, manuals, and invoices.
          </p>
          <p className="mt-2 text-gray-700">Certain items are non-returnable, including:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Customized or special-order products.</li>
            <li>Products marked as “Non-Returnable” on the Website.</li>
            <li>Software, licenses, or digital goods once activated.</li>
          </ul>
        </section>

        {/* 3. Refund Process */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">3. Refund Process</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</li>
            <li>If approved, refunds will be processed within <strong>7–10 business days</strong> through the original mode of payment.</li>
            <li>Shipping and handling charges are non-refundable, unless the return is due to an error on our part.</li>
          </ul>
        </section>

        {/* 4. Replacements & Exchanges */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">4. Replacements & Exchanges</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>If a product is eligible for replacement, NexFuga will provide a replacement of the same item (subject to stock availability).</li>
            <li>If the same item is unavailable, you may opt for a refund or select an alternative product of equal value.</li>
          </ul>
        </section>

        {/* 5. Order Cancellations */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">5. Order Cancellations</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Orders can be canceled by the customer only before they are shipped.</li>
            <li>Once an order is shipped, cancellation requests will not be accepted.</li>
            <li>NexFuga reserves the right to cancel any order due to:</li>
          </ul>
          <ul className="list-disc pl-10 mt-1 space-y-1 text-gray-700">
            <li>Product unavailability.</li>
            <li>Pricing or technical errors.</li>
            <li>Fraud detection or violation of Terms of Use.</li>
          </ul>
        </section>

        {/* 6. Shipping of Returns */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">6. Shipping of Returns</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
            <li>Customers are responsible for safely packaging and shipping the return to the address provided by NexFuga.</li>
            <li>In cases where the return is due to our error (wrong product, damaged delivery, etc.), NexFuga will bear the return shipping costs.</li>
          </ul>
        </section>

        {/* 7. Contact for Returns & Refunds */}
        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-900">7. Contact for Returns & Refunds</h2>
          <div className="mt-2 text-gray-700 space-y-1">
            <p><strong>Customer Support / Grievance Officer</strong></p>
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

        {/* Footer link */}
        <div className="mt-12">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPolicyPage;