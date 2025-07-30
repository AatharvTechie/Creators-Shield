'use client';

import Link from 'next/link';

export default function AllRightsReservedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c2f] to-[#232946] text-white">
      {/* Header */}
      <div className="bg-[#232946]/80 backdrop-blur-sm border-b border-blue-900/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-blue-300 hover:text-blue-200 transition-colors">
              CreatorShield
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/plans" className="text-gray-300 hover:text-white transition-colors">
                Plans
              </Link>
              <Link href="/faq" className="text-gray-300 hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/contacts" className="text-gray-300 hover:text-white transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-blue-300">All Rights Reserved</h1>
          <p className="text-xl text-gray-300">Legal Information & Copyright Notice</p>
        </div>

        {/* Legal Sections */}
        <div className="space-y-8">
          {/* Copyright Notice */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
            <h2 className="text-2xl font-bold mb-4 text-blue-200">© Copyright Notice</h2>
            <div className="text-gray-200 space-y-4">
              <p>
                <strong>CreatorShield</strong> and all associated content, including but not limited to text, graphics, 
                logos, images, software, and design elements, are the exclusive property of CreatorShield Technologies Pvt. Ltd.
              </p>
              <p>
                All rights are reserved. No part of this website, application, or service may be reproduced, 
                distributed, or transmitted in any form or by any means without prior written permission.
              </p>
              <p className="text-blue-300 font-semibold">
                © {new Date().getFullYear()} CreatorShield Technologies Pvt. Ltd. All rights reserved.
              </p>
            </div>
          </div>

          {/* Trademark Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
            <h2 className="text-2xl font-bold mb-4 text-green-200">™ Trademark Information</h2>
            <div className="text-gray-200 space-y-4">
              <p>
                <strong>CreatorShield™</strong> is a registered trademark of CreatorShield Technologies Pvt. Ltd.
              </p>
              <p>
                The following terms and phrases are trademarks or service marks of CreatorShield:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>CreatorShield™</li>
                <li>Content Protection AI™</li>
                <li>DMCA Guardian™</li>
                <li>CreatorShield Logo™</li>
              </ul>
              <p>
                Unauthorized use of these trademarks is strictly prohibited and may result in legal action.
              </p>
            </div>
          </div>

          {/* Intellectual Property Rights */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 text-purple-200">🔒 Intellectual Property Rights</h2>
            <div className="text-gray-200 space-y-4">
              <p>
                CreatorShield owns and retains all intellectual property rights in and to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The CreatorShield platform and all its components</li>
                <li>AI algorithms and machine learning models</li>
                <li>Content protection and copyright detection systems</li>
                <li>User interface designs and user experience elements</li>
                <li>Database structures and data processing methods</li>
                <li>API integrations and third-party service connections</li>
                <li>Documentation, manuals, and training materials</li>
              </ul>
            </div>
          </div>

          {/* Permitted Uses */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-orange-500/30">
            <h2 className="text-2xl font-bold mb-4 text-orange-200">✅ Permitted Uses</h2>
            <div className="text-gray-200 space-y-4">
              <p>You may use CreatorShield services for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Protecting your own original content</li>
                <li>Monitoring copyright violations of your work</li>
                <li>Filing legitimate DMCA takedown requests</li>
                <li>Accessing support and customer service</li>
                <li>Using features as intended by the platform</li>
              </ul>
              <p className="text-orange-300 font-semibold">
                All uses must comply with our Terms of Service and Acceptable Use Policy.
              </p>
            </div>
          </div>

          {/* Prohibited Uses */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-red-500/30">
            <h2 className="text-2xl font-bold mb-4 text-red-200">❌ Prohibited Uses</h2>
            <div className="text-gray-200 space-y-4">
              <p>The following activities are strictly prohibited:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Reverse engineering or decompiling our software</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using our services for illegal or fraudulent activities</li>
                <li>Filing false copyright claims or abuse reports</li>
                <li>Reselling or redistributing our services without permission</li>
                <li>Using our trademarks without written consent</li>
                <li>Attempting to circumvent our security measures</li>
              </ul>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-teal-500/30">
            <h2 className="text-2xl font-bold mb-4 text-teal-200">⚖️ Legal Compliance</h2>
            <div className="text-gray-200 space-y-4">
              <p>
                CreatorShield operates in compliance with applicable laws and regulations, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Digital Millennium Copyright Act (DMCA)</li>
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>Indian Information Technology Act, 2000</li>
                <li>Copyright laws of relevant jurisdictions</li>
              </ul>
              <p>
                We maintain strict adherence to legal requirements and regularly update our practices 
                to ensure continued compliance.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-cyan-500/30">
            <h2 className="text-2xl font-bold mb-4 text-cyan-200">📞 Legal Contact Information</h2>
            <div className="text-gray-200 space-y-4">
              <p><strong>For legal inquiries, copyright issues, or trademark matters:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-cyan-300">Legal Department</h3>
                  <p>CreatorShield Technologies Pvt. Ltd.</p>
                  <p>Email: legal@creatorshield.com</p>
                  <p>Phone: +91-7042174467</p>
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-300">Copyright Agent</h3>
                  <p>For DMCA notices and copyright claims</p>
                  <p>Email: copyright@creatorshield.com</p>
                  <p>Address: [Legal Address]</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
} 