'use client';

import Link from 'next/link';
import { WhatsAppButton, WhatsAppLink } from '@/components/ui/whatsapp-button';

export default function ContactPage() {
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
              <Link href="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-blue-300">Contact Us</h1>
          <p className="text-xl text-gray-300">Get in touch with our creator support team</p>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email Support */}
          <div className="bg-blue-600/20 backdrop-blur-lg rounded-xl p-8 border border-blue-400/30">
            <div className="text-center">
              <svg className="h-16 w-16 text-blue-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <h2 className="text-2xl font-bold mb-4 text-white">Email Support</h2>
              <p className="text-gray-200 mb-6">Get detailed responses within 2 hours</p>
              <a 
                href="mailto:support@creatorshield.com" 
                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Send Email
              </a>
            </div>
          </div>

          {/* WhatsApp Support */}
          <div className="bg-green-600/20 backdrop-blur-lg rounded-xl p-8 border border-green-400/30">
            <div className="text-center">
              <svg className="h-16 w-16 text-green-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
              </svg>
              <h2 className="text-2xl font-bold mb-4 text-white">WhatsApp Support</h2>
              <p className="text-gray-200 mb-6">Instant help from our support team</p>
              <WhatsAppButton 
                className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
                customMessage="I need help with CreatorShield"
              >
                Start Chat
              </WhatsAppButton>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600/30">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Support Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-300">Response Time</h3>
              <p className="text-gray-300">Within 2 hours</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-300">Availability</h3>
              <p className="text-gray-300">24/7 Support</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-purple-300">Languages</h3>
              <p className="text-gray-300">English & Hindi</p>
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