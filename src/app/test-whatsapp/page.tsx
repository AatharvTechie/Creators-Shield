'use client';

import { useState } from 'react';
import { WhatsAppButton, WhatsAppLink } from '@/components/ui/whatsapp-button';
import { generateWhatsAppUrl, getUserDataForWhatsApp } from '@/lib/whatsapp-utils';

export default function TestWhatsAppPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  const handleTestWhatsApp = () => {
    const userData = {
      userName: userName || '[Creator]',
      userEmail: userEmail || '',
      issue: customMessage || 'I need help with CreatorShield',
      source: 'Test Page'
    };

    const url = generateWhatsAppUrl(userData);
    console.log('Generated WhatsApp URL:', url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const currentUserData = getUserDataForWhatsApp();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#181c2f] to-[#232946] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-blue-300">WhatsApp Integration Test</h1>
        
        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-300">Current User Data</h2>
          <pre className="bg-gray-800 p-4 rounded-lg text-sm overflow-auto">
            {JSON.stringify(currentUserData, null, 2)}
          </pre>
        </div>

        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">Test WhatsApp Integration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">User Name:</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">User Email:</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Custom Message:</label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message"
                rows={3}
                className="w-full p-3 rounded-lg bg-gray-800 border border-gray-600 text-white"
              />
            </div>
            
            <button
              onClick={handleTestWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Test WhatsApp Integration
            </button>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Component Examples</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Button:</h3>
              <WhatsAppButton 
                customMessage="Testing from test page"
                className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Test WhatsApp Button
              </WhatsAppButton>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">WhatsApp Link:</h3>
              <WhatsAppLink 
                customMessage="Testing link from test page"
                className="text-green-300 hover:text-green-200 underline"
              >
                Test WhatsApp Link
              </WhatsAppLink>
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-yellow-300">Generated URL Preview</h2>
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-300 mb-2">WhatsApp URL with current data:</p>
            <code className="text-xs text-green-300 break-all">
              {generateWhatsAppUrl({
                userName: userName || '[Creator]',
                userEmail: userEmail || '',
                issue: customMessage || 'I need help with CreatorShield',
                source: 'Test Page'
              })}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
} 