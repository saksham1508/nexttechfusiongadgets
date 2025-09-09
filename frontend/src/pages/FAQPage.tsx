import React from 'react';
import { Link } from 'react-router-dom';

const FAQPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions (FAQ)</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 2025</p>
        </header>

        {/* Intro */}
        <section className="prose prose-gray max-w-none">
          <p className="text-gray-700">
            Welcome to NexFuga (NEXT TECH FUSION GADGETS PRIVATE LIMITED). Below are answers to the most commonly asked questions about our business, orders, payments, shipping, returns, and support.
          </p>
        </section>

        {/* FAQ List */}
        <section className="mt-10 space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">1. What is NexFuga?</h2>
            <p className="mt-2 text-gray-700">
              NexFuga (NEXT TECH FUSION GADGETS PRIVATE LIMITED) is a technology solutions company incorporated in 2025 and headquartered in Jabalpur, Madhya Pradesh. We specialize in the wholesale distribution of advanced commercial technology equipment, peripherals, connectivity devices, and next-generation digital tools.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">2. Do you sell directly to individuals or only businesses?</h2>
            <p className="mt-2 text-gray-700">
              Currently, NexFuga primarily caters to businesses, institutions, and bulk buyers. However, individual customers may also purchase products depending on availability.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">3. How can I place an order?</h2>
            <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
              <li>Browse products on our website <a href="https://www.nexfuga.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">nexfuga.com</a>.</li>
              <li>Add items to your cart and proceed to checkout.</li>
              <li>Complete the payment using the available payment methods.</li>
              <li>Once confirmed, you will receive an email/SMS with your order ID.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">4. What payment methods do you accept?</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
              <li>Credit/Debit Cards</li>
              <li>Net Banking</li>
              <li>UPI</li>
              <li>Authorized payment gateways</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">5. Do you offer Cash on Delivery (COD)?</h2>
            <p className="mt-2 text-gray-700">Yes, currently Cash on Delivery is available.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">6. How long does shipping take?</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
              <li>Orders are usually processed within 2–4 business days.</li>
              <li>Delivery within India typically takes 5–10 business days depending on the location.</li>
              <li>Remote areas may take longer.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">7. Can I track my order?</h2>
            <p className="mt-2 text-gray-700">
              Yes. Once your order is shipped, you will receive a tracking link and ID via email/SMS to monitor the delivery.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">8. What is your return policy?</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
              <li>Products can be returned within 7 days of delivery if they are damaged, defective, or not as described.</li>
              <li>Items must be unused, in original packaging, and with all accessories/invoice.</li>
              <li>Certain items (like customized orders, consumables, or digital goods) are non-returnable.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">9. How do refunds work?</h2>
            <ul className="mt-2 list-disc pl-6 space-y-1 text-gray-700">
              <li>Once we receive and inspect your return, refunds are processed within 7–10 business days.</li>
              <li>Refunds are issued to the original mode of payment.</li>
              <li>Shipping fees are non-refundable unless the return is due to NexFuga’s error.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">10. Do your products come with a warranty?</h2>
            <p className="mt-2 text-gray-700">
              Yes, most products sold by NexFuga include a limited manufacturer’s or company warranty (usually 12 months unless otherwise specified). Warranty coverage details are provided with each product.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">11. How do I claim a warranty?</h2>
            <ol className="mt-2 list-decimal pl-6 space-y-1 text-gray-700">
              <li>Contact our Customer Support Team with your invoice/order ID.</li>
              <li>Ship the defective product to the service address we provide.</li>
              <li>After inspection, we will repair, replace, or refund as per the Warranty Policy.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">12. Do you ship internationally?</h2>
            <p className="mt-2 text-gray-700">
              Currently, we ship across India. For international orders, please contact our support team to check availability and charges.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900">13. Who do I contact for support?</h2>
            <div className="mt-2 text-gray-700 space-y-1">
              <p><strong>Customer Support / Grievance Officer</strong></p>
              <p>NEXT TECH FUSION GADGETS PRIVATE LIMITED</p>
              <p>Jabalpur, Madhya Pradesh, India</p>
              <p><strong>Email:</strong> <a href="mailto:saksham1508@gmail.com" className="text-blue-600 hover:underline">saksham1508@gmail.com</a></p>
              <p><strong>Phone:</strong> <a href="tel:+918839825442" className="text-blue-600 hover:underline">+91 8839825442</a></p>
            </div>
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

export default FAQPage;