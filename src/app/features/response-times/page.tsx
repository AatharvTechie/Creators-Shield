"use client";
import Link from "next/link";
import { FaClock, FaRocket, FaBell, FaChartLine, FaShieldAlt, FaUsers, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function ResponseTimesFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a223f] to-[#232946] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-blue-300">Response Times & Processing</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Learn about our lightning-fast response times and how we process takedown requests to protect your content quickly and efficiently.
          </p>
        </div>

        {/* Response Time Overview */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Our Response Time Guarantees</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30 text-center">
              <FaRocket className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Premium Plan</h3>
              <div className="text-4xl font-bold text-green-400 mb-2">1 Hour</div>
              <p className="text-gray-300 mb-4">Ultra-fast processing for urgent cases</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Priority queue processing</li>
                <li>• Dedicated support team</li>
                <li>• Real-time notifications</li>
                <li>• Direct escalation</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30 text-center">
              <FaClock className="text-5xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Monthly Plan</h3>
              <div className="text-4xl font-bold text-blue-400 mb-2">2 Hours</div>
              <p className="text-gray-300 mb-4">Fast processing for most cases</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Standard queue processing</li>
                <li>• Email notifications</li>
                <li>• Detailed reports</li>
                <li>• Support assistance</li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-orange-500/30 text-center">
              <FaShieldAlt className="text-5xl text-orange-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Free Trial</h3>
              <div className="text-4xl font-bold text-orange-400 mb-2">48 Hours</div>
              <p className="text-gray-300 mb-4">Standard processing time</p>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• Basic queue processing</li>
                <li>• Email notifications</li>
                <li>• Standard reports</li>
                <li>• Community support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Processing Steps */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">How We Process Takedown Requests</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">1</div>
              <h3 className="text-lg font-bold text-white mb-2">Detection</h3>
              <p className="text-gray-300 text-sm">
                AI system detects unauthorized use of your content across monitored platforms
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-green-500/30 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">2</div>
              <h3 className="text-lg font-bold text-white mb-2">Verification</h3>
              <p className="text-gray-300 text-sm">
                Our team verifies the violation and prepares the takedown request
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">3</div>
              <h3 className="text-lg font-bold text-white mb-2">Submission</h3>
              <p className="text-gray-300 text-sm">
                DMCA takedown request is submitted to the platform with proper documentation
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-orange-500/30 text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">4</div>
              <h3 className="text-lg font-bold text-white mb-2">Follow-up</h3>
              <p className="text-gray-300 text-sm">
                We track the request status and follow up until content is removed
              </p>
            </div>
          </div>
        </section>

        {/* Success Rates */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Success Rates by Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-red-500/30 text-center">
              <h3 className="text-xl font-bold text-white mb-2">YouTube</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">98.5%</div>
              <p className="text-gray-300 text-sm">Success rate for video takedowns</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Instagram</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">96.2%</div>
              <p className="text-gray-300 text-sm">Success rate for post removals</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-black/30 text-center">
              <h3 className="text-xl font-bold text-white mb-2">TikTok</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">94.8%</div>
              <p className="text-gray-300 text-sm">Success rate for video takedowns</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Facebook</h3>
              <div className="text-3xl font-bold text-green-400 mb-2">97.1%</div>
              <p className="text-gray-300 text-sm">Success rate for content removal</p>
            </div>
          </div>
        </section>

        {/* Real-time Tracking */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Real-time Tracking & Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
              <div className="flex items-center gap-4 mb-6">
                <FaBell className="text-4xl text-green-400" />
                <h3 className="text-2xl font-bold text-white">Instant Notifications</h3>
              </div>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mr-3 mt-1" />
                  <span>Violation detection alerts</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mr-3 mt-1" />
                  <span>Takedown request status updates</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mr-3 mt-1" />
                  <span>Content removal confirmations</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-green-400 mr-3 mt-1" />
                  <span>Weekly protection summaries</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
              <div className="flex items-center gap-4 mb-6">
                <FaChartLine className="text-4xl text-blue-400" />
                <h3 className="text-2xl font-bold text-white">Progress Tracking</h3>
              </div>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-400 mr-3 mt-1" />
                  <span>Real-time request status</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-400 mr-3 mt-1" />
                  <span>Response time analytics</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-400 mr-3 mt-1" />
                  <span>Success rate tracking</span>
                </li>
                <li className="flex items-start">
                  <FaCheckCircle className="text-blue-400 mr-3 mt-1" />
                  <span>Performance insights</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Response Time Case Studies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
              <div className="flex items-center gap-4 mb-4">
                <FaUsers className="text-3xl text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Gaming Content Creator</h3>
                  <p className="text-gray-400">Premium Plan User</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "My gaming videos were being reuploaded within minutes. CreatorShield detected and removed 12 violations in under 1 hour. Their response time is incredible!"
              </p>
              <div className="text-green-400 font-semibold">12 violations removed in 45 minutes</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
              <div className="flex items-center gap-4 mb-4">
                <FaUsers className="text-3xl text-blue-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Fitness Influencer</h3>
                  <p className="text-gray-400">Monthly Plan User</p>
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                "Someone was stealing my workout videos and claiming them as their own. CreatorShield removed all 8 violations within 2 hours. Game changer!"
              </p>
              <div className="text-blue-400 font-semibold">8 violations removed in 1.5 hours</div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-12 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-6 text-white">Experience Fast Response Times</h2>
            <p className="text-xl text-gray-300 mb-8">
              Choose a plan that matches your content protection needs and response time requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                View Plans & Pricing
              </Link>
              <Link href="/features/protection" className="bg-white/10 text-white font-bold py-4 px-8 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                Learn About Protection
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 