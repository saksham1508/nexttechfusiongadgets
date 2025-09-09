import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
          <p className="mt-2 text-sm text-gray-500">Last Updated: September 2025</p>
        </header>

        {/* Company Overview */}
        <section className="space-y-4">
          <p className="text-gray-700">
            <strong>NEXT TECH FUSION GADGETS PRIVATE LIMITED (NexFuga)</strong> is an emerging force in India's digital transformation landscape, proudly headquartered in Jabalpur, Madhya Pradesh. Established in 2025, we specialise in the wholesale distribution of advanced commercial technology equipment—including computing peripherals, connectivity devices, and next-generation digital tools.
          </p>
          <p className="text-gray-700">
            Driven by a commitment to bridge the gap between innovation and accessibility, we deliver high-quality, reliable gadgets designed to meet the dynamic needs of modern enterprises and technology-driven consumers alike. At <strong>NEXTTECHFUSIONGADGETS</strong>, we don’t just distribute products—we empower businesses and individuals to embrace a smarter, more connected future.
          </p>
          <p className="text-gray-700">We are working in <strong>AI</strong>, <strong>Unicommerce</strong>, and as an <strong>IT company</strong>.</p>
        </section>

        {/* Company Facts */}
        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Industry</h2>
            <p className="mt-1 text-gray-700">Technology, Information and Internet</p>
          </div>
          <div className="rounded-lg border border-gray-2 00 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Company Size</h2>
            <p className="mt-1 text-gray-700">11–50 employees</p>
            <p className="mt-1 text-sm text-gray-500">8 associated LinkedIn members have listed NexFuga as their current workplace.</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Headquarters</h2>
            <p className="mt-1 text-gray-700">Jabalpur, Madhya Pradesh, India</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">Founded</h2>
            <p className="mt-1 text-gray-700">2025</p>
          </div>
        </section>

        {/* Callouts */}
        <section className="mt-8 rounded-lg bg-blue-50 border border-blue-200 p-4">
          <p className="text-blue-900 text-sm">
            For partnerships, bulk orders, or enterprise solutions, please reach out via our Contact page.
          </p>
        </section>

        {/* Footer link */}
        <div className="mt-12 flex items-center gap-6">
          <Link to="/" className="text-blue-600 hover:underline">Back to Home</Link>
          <Link to="/contact" className="text-blue-600 hover:underline">Contact Us</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;