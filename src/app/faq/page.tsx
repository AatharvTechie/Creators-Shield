'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Phone } from 'lucide-react';
import Link from 'next/link';
import { WhatsAppButton, WhatsAppLink } from '@/components/ui/whatsapp-button';

interface FAQItem {
  id: string;
  question: string;
  answer: string[];
  category: string;
  icon: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How does CreatorShield protect my content?',
    answer: [
      'Step 1: Connect your YouTube channel securely through our OAuth system',
      'Step 2: Our AI scans your content and creates unique digital fingerprints',
      'Step 3: We continuously monitor platforms for potential copyright violations',
      'Step 4: When violations are detected, you receive instant alerts with evidence',
      'Step 5: Our team helps you file DMCA takedowns and resolve disputes'
    ],
    category: 'Protection',
    icon: '🛡️'
  },
  {
    id: '2',
    question: "What's included in the free trial?",
    answer: [
      '✅ Full Access: All premium features for 7 days',
      '✅ Content Protection: Monitor up to 50 videos',
      '✅ DMCA Support: 3 takedown requests included',
      '✅ Priority Support: Direct access to our creator support team',
      '✅ No Credit Card: Required for trial - cancel anytime'
    ],
    category: 'Pricing',
    icon: '💰'
  },
  {
    id: '3',
    question: 'How quickly can I start protecting my content?',
    answer: [
      'Immediate Setup: Sign up and connect your YouTube channel in under 5 minutes',
      'Instant Scanning: Our AI begins analyzing your content within 10 minutes',
      'Real-time Monitoring: Start receiving alerts within 24 hours',
      'Quick Response: Our team responds to violations within 2-4 hours',
      'Fast Takedowns: Average DMCA processing time: 24-48 hours'
    ],
    category: 'Setup',
    icon: '⚡'
  },
  {
    id: '4',
    question: 'What happens if someone steals my content?',
    answer: [
      '1. Instant Detection: Our AI identifies the violation within minutes',
      '2. Evidence Collection: We gather all proof and timestamps',
      '3. Alert Notification: You receive detailed report via email',
      '4. DMCA Filing: Our legal team handles the takedown process',
      '5. Follow-up: We ensure the content stays down and monitor for re-uploads'
    ],
    category: 'Protection',
    icon: '🛡️'
  },
  {
    id: '5',
    question: 'Which platforms do you monitor?',
    answer: [
      'Primary Platforms: YouTube, Instagram, TikTok, Facebook',
      'Extended Coverage: Twitter, LinkedIn, Pinterest, Reddit',
      'Web Monitoring: Blogs, websites, and news sites',
      'International: Global platforms and regional content sites',
      'Custom Requests: We can monitor specific platforms you\'re concerned about'
    ],
    category: 'Coverage',
    icon: '📱'
  },
  {
    id: '6',
    question: 'Can I cancel my subscription anytime?',
    answer: [
      '✅ Yes, absolutely! No long-term contracts or hidden fees',
      '📅 Monthly Plans: Cancel anytime, access until end of billing period',
      '📅 Yearly Plans: Cancel anytime, prorated refund available',
      '🔄 Easy Process: Cancel with one click in your dashboard',
      '📧 Confirmation: You\'ll receive email confirmation of cancellation'
    ],
    category: 'Pricing',
    icon: '💳'
  },
  {
    id: '7',
    question: 'Is my data and content secure?',
    answer: [
      '🔐 Encryption: All data encrypted with AES-256',
      '🛡️ Privacy: We never share your content with third parties',
      '🔑 Secure Access: OAuth 2.0 for platform connections',
      '📊 GDPR Compliant: Full compliance with data protection laws',
      '🗑️ Data Control: Delete your data anytime from dashboard'
    ],
    category: 'Security',
    icon: '🔒'
  },
  {
    id: '8',
    question: 'What kind of support do you provide?',
    answer: [
      '🎯 Priority Support: Direct access to creator support specialists',
      '⏰ Response Time: Average response within 2 hours',
      '📧 Multiple Channels: Email, live chat, and video calls',
      '📚 Resources: Comprehensive help center and video tutorials',
      '👥 Community: Access to creator community for peer support'
    ],
    category: 'Support',
    icon: '📞'
  },
  {
    id: '9',
    question: 'How does CreatorShield help me grow?',
    answer: [
      '🎯 Content Protection: Focus on creating while we protect your work',
      '💰 Revenue Protection: Prevent revenue loss from stolen content',
      '📊 Analytics: Detailed insights about content performance',
      '🤝 Legal Support: Professional help with copyright disputes',
      '🚀 Growth Tools: Recommendations for content optimization'
    ],
    category: 'Growth',
    icon: '📈'
  },
  {
    id: '10',
    question: 'What if I receive a false copyright claim?',
    answer: [
      '🛡️ Protection: We help you fight false claims',
      '📋 Documentation: We gather evidence to prove your innocence',
      '⚖️ Legal Support: Our team assists with counter-notifications',
      '📞 Platform Liaison: We communicate directly with platforms',
      '✅ Resolution: We ensure your content is restored and monetized'
    ],
    category: 'Legal',
    icon: '⚖️'
  }
];

const categories = ['All', 'Protection', 'Pricing', 'Setup', 'Coverage', 'Security', 'Support', 'Growth', 'Legal'];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const filteredFAQs = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-blue-300">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-300">Everything you need to know about protecting your creative content</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map(faq => (
            <div key={faq.id} className="bg-white/10 backdrop-blur-lg rounded-xl border border-blue-500/30 overflow-hidden">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{faq.icon}</span>
                  <h3 className="text-lg font-semibold text-blue-200">{faq.question}</h3>
                </div>
                {openItems.includes(faq.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              
              {openItems.includes(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="space-y-3 text-gray-200">
                    {faq.answer.map((item, index) => (
                      <p key={index} className="text-sm leading-relaxed">{item}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 border border-blue-400/30">
            <h2 className="text-3xl font-bold mb-4 text-white">Still have questions?</h2>
            <p className="text-gray-200 mb-8 text-lg">Our creator support team is here to help you 24/7</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 rounded-lg p-6">
                <svg className="h-8 w-8 text-blue-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <h3 className="font-semibold mb-2">Email Support</h3>
                <p className="text-sm text-gray-300 mb-3">Get detailed responses within 2 hours</p>
                <a href="mailto:support@creatorshield.com" className="text-blue-300 hover:text-blue-200 text-sm">
                  support@creatorshield.com
                </a>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <svg className="h-8 w-8 text-green-300 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-gray-300 mb-3">Instant help from our support team</p>
                <WhatsAppLink className="text-green-300 hover:text-green-200 text-sm">
                  Start Chat Now
                </WhatsAppLink>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6">
                <Phone className="h-8 w-8 text-purple-300 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Video Call</h3>
                <p className="text-sm text-gray-300 mb-3">Schedule a personalized session</p>
                <a href="/contact" className="text-purple-300 hover:text-purple-200 text-sm">
                  Book Session
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 border border-green-400/30">
            <h2 className="text-2xl font-bold mb-4 text-white">Ready to protect your content?</h2>
            <p className="text-gray-200 mb-6">Join thousands of creators who trust CreatorShield</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/plans" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 