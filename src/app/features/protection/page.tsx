"use client";
import Link from "next/link";
import { FaShieldAlt, FaEye, FaRocket, FaChartLine, FaBell, FaFileAlt, FaUsers, FaCog } from "react-icons/fa";

export default function ProtectionFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a223f] to-[#232946] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-blue-300">Content Protection System</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Advanced AI-powered protection that monitors, detects, and removes unauthorized use of your content across multiple platforms.
          </p>
        </div>

        {/* How It Works */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">How CreatorShield Protects Your Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
              <div className="text-center mb-6">
                <FaEye className="text-5xl text-blue-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">1. Continuous Monitoring</h3>
              </div>
              <p className="text-gray-300 text-lg">
                Our AI system continuously scans YouTube, Instagram, TikTok, and other platforms for unauthorized use of your content. We monitor 24/7 to ensure nothing slips through.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
              <div className="text-center mb-6">
                <FaShieldAlt className="text-5xl text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">2. Smart Detection</h3>
              </div>
              <p className="text-gray-300 text-lg">
                Advanced AI algorithms detect reuploads, reposts, and modified versions of your content. Our system can identify your work even when it's been edited or cropped.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30">
              <div className="text-center mb-6">
                <FaRocket className="text-5xl text-purple-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white">3. Automatic Action</h3>
              </div>
              <p className="text-gray-300 text-lg">
                When violations are detected, we automatically generate and send DMCA takedown requests. You get real-time notifications and detailed reports of all actions taken.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Key Protection Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600/30">
              <div className="flex items-center gap-4 mb-4">
                <FaChartLine className="text-3xl text-blue-400" />
                <h3 className="text-xl font-bold text-white">Real-time Analytics</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Track your content protection performance with detailed analytics. Monitor detection rates, takedown success rates, and platform-specific insights.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• Detection accuracy metrics</li>
                <li>• Response time tracking</li>
                <li>• Platform-specific reports</li>
                <li>• Historical data analysis</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600/30">
              <div className="flex items-center gap-4 mb-4">
                <FaBell className="text-3xl text-green-400" />
                <h3 className="text-xl font-bold text-white">Instant Notifications</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Get immediate alerts when violations are detected. Choose your preferred notification method: email, SMS, or in-app notifications.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• Real-time violation alerts</li>
                <li>• Takedown status updates</li>
                <li>• Custom notification settings</li>
                <li>• Priority alert system</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600/30">
              <div className="flex items-center gap-4 mb-4">
                <FaFileAlt className="text-3xl text-purple-400" />
                <h3 className="text-xl font-bold text-white">Detailed Reports</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Generate comprehensive reports for legal purposes or content analysis. Export data in multiple formats for your records.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• PDF report generation</li>
                <li>• Legal documentation</li>
                <li>• Custom report templates</li>
                <li>• Automated reporting</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-gray-600/30">
              <div className="flex items-center gap-4 mb-4">
                <FaCog className="text-3xl text-orange-400" />
                <h3 className="text-xl font-bold text-white">Custom Settings</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Customize your protection settings based on your content type and preferences. Set different rules for different types of content.
              </p>
              <ul className="text-gray-300 space-y-2">
                <li>• Content type filters</li>
                <li>• Platform-specific rules</li>
                <li>• Sensitivity adjustments</li>
                <li>• Automated workflows</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Success Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
              <div className="flex items-center gap-4 mb-4">
                <FaUsers className="text-3xl text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">YouTube Creator</h3>
                  <p className="text-gray-400">500K subscribers</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "CreatorShield helped me remove 47 unauthorized reuploads of my videos within 48 hours. Their AI detection is incredibly accurate!"
              </p>
              <div className="text-green-400 font-semibold">47 violations removed in 48 hours</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
              <div className="flex items-center gap-4 mb-4">
                <FaUsers className="text-3xl text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Instagram Influencer</h3>
                  <p className="text-gray-400">200K followers</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "I was losing revenue to stolen content. CreatorShield's automated system now protects my posts across all platforms automatically."
              </p>
              <div className="text-blue-400 font-semibold">Revenue increased by 35%</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-12 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to Protect Your Content?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Join thousands of creators who trust CreatorShield to protect their valuable content.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/features/platforms" className="bg-white/10 text-white font-bold py-4 px-8 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                View Supported Platforms
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 