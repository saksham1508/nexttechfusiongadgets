import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="mt-2 text-sm text-gray-500">We'd love to hear from you</p>
        </header>

        {/* Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Email</h2>
            </div>
            <a href="mailto:info@nexfuga.com" className="mt-3 block text-blue-600 hover:underline break-all">
              info@nexfuga.com
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Phone</h2>
            </div>
            <a href="tel:+918839825442" className="mt-3 block text-blue-600 hover:underline">
              +91 8839825442
            </a>
          </div>

          <div className="rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            </div>
            <p className="mt-3 text-gray-700">Napier Town, Jabalpur, MP</p>
          </div>
        </section>

        {/* Simple message hint */}
        <section className="mt-10 rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
          For business enquiries, partnerships, or bulk orders, please email or call us. We'll respond within 1–2 business days.
        </section>
      </div>
    </div>
  );
};

export default ContactPage;