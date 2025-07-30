"use client";
import Link from "next/link";
import { FaYoutube, FaInstagram, FaTiktok, FaFacebook, FaTwitter, FaSnapchat, FaTwitch, FaVimeo } from "react-icons/fa";

export default function PlatformsFeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a223f] to-[#232946] text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-blue-300">Supported Platforms</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We monitor all major social media and content platforms to ensure your content is protected everywhere it appears.
          </p>
        </div>

        {/* Primary Platforms */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Primary Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-red-500/30 text-center hover:border-red-400/50 transition-all duration-300">
              <FaYoutube className="text-6xl text-red-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">YouTube</h3>
              <p className="text-gray-300 mb-4">
                Monitor video reuploads, shorts, and live streams across all YouTube channels.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Video detection</div>
                <div>• Shorts monitoring</div>
                <div>• Live stream protection</div>
                <div>• Channel scanning</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-pink-500/30 text-center hover:border-pink-400/50 transition-all duration-300">
              <FaInstagram className="text-6xl text-pink-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Instagram</h3>
              <p className="text-gray-300 mb-4">
                Protect your posts, stories, reels, and IGTV content from unauthorized use.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Post monitoring</div>
                <div>• Story protection</div>
                <div>• Reel detection</div>
                <div>• IGTV scanning</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-black/30 text-center hover:border-gray-400/50 transition-all duration-300">
              <FaTiktok className="text-6xl text-black mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">TikTok</h3>
              <p className="text-gray-300 mb-4">
                Detect unauthorized use of your videos, sounds, and creative content.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Video detection</div>
                <div>• Sound monitoring</div>
                <div>• Trend tracking</div>
                <div>• Duet protection</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30 text-center hover:border-blue-400/50 transition-all duration-300">
              <FaFacebook className="text-6xl text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Facebook</h3>
              <p className="text-gray-300 mb-4">
                Monitor posts, videos, and shared content across Facebook pages and groups.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Post monitoring</div>
                <div>• Video detection</div>
                <div>• Group scanning</div>
                <div>• Page protection</div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary Platforms */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Additional Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-400/30 text-center hover:border-blue-300/50 transition-all duration-300">
              <FaTwitter className="text-6xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Twitter</h3>
              <p className="text-gray-300 mb-4">
                Monitor tweets, videos, and media content for unauthorized use.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Tweet monitoring</div>
                <div>• Video detection</div>
                <div>• Thread protection</div>
                <div>• Media scanning</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-yellow-500/30 text-center hover:border-yellow-400/50 transition-all duration-300">
              <FaSnapchat className="text-6xl text-yellow-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Snapchat</h3>
              <p className="text-gray-300 mb-4">
                Protect your snaps, stories, and discover content from unauthorized sharing.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Snap monitoring</div>
                <div>• Story protection</div>
                <div>• Discover scanning</div>
                <div>• Filter detection</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 text-center hover:border-purple-400/50 transition-all duration-300">
              <FaTwitch className="text-6xl text-purple-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Twitch</h3>
              <p className="text-gray-300 mb-4">
                Monitor live streams, clips, and VOD content for unauthorized use.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Stream monitoring</div>
                <div>• Clip detection</div>
                <div>• VOD protection</div>
                <div>• Highlight scanning</div>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-600/30 text-center hover:border-blue-500/50 transition-all duration-300">
              <FaVimeo className="text-6xl text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Vimeo</h3>
              <p className="text-gray-300 mb-4">
                Protect your professional video content from unauthorized distribution.
              </p>
              <div className="text-sm text-gray-400">
                <div>• Video monitoring</div>
                <div>• Channel protection</div>
                <div>• Project scanning</div>
                <div>• Portfolio detection</div>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring Capabilities */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Advanced Monitoring Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Content Detection</h3>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Video content (MP4, MOV, AVI, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Image content (JPG, PNG, GIF, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Audio content (MP3, WAV, etc.)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Text content and captions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Modified or edited versions</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30">
              <h3 className="text-2xl font-bold text-white mb-4">Detection Methods</h3>
              <ul className="text-gray-300 space-y-3">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Visual fingerprinting technology</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Audio waveform analysis</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Metadata comparison</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>AI-powered content matching</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Cross-platform content tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Platform Statistics */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">Platform Coverage Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-green-500/30 text-center">
              <div className="text-4xl font-bold text-green-400 mb-2">15+</div>
              <div className="text-xl text-white mb-2">Platforms Monitored</div>
              <p className="text-gray-300">Covering all major social media and content platforms</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-blue-500/30 text-center">
              <div className="text-4xl font-bold text-blue-400 mb-2">99.7%</div>
              <div className="text-xl text-white mb-2">Detection Accuracy</div>
              <p className="text-gray-300">Advanced AI ensures high accuracy in content detection</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-purple-500/30 text-center">
              <div className="text-4xl font-bold text-purple-400 mb-2">24/7</div>
              <div className="text-xl text-white mb-2">Continuous Monitoring</div>
              <p className="text-gray-300">Round-the-clock protection for your content</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-lg rounded-xl p-12 border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to Protect Your Content?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Start monitoring your content across all these platforms today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Trial
              </Link>
              <Link href="/features/response-times" className="bg-white/10 text-white font-bold py-4 px-8 rounded-lg hover:bg-white/20 transition-colors border border-white/20">
                Learn About Response Times
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
} 