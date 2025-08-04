'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Speaker, Mail, AlertTriangle } from 'lucide-react';

export default function TestAdminFeedbackPage() {
  const [creatorId, setCreatorId] = useState('507f1f77bcf86cd799439011'); // Example MongoDB ObjectId
  const [feedbackType, setFeedbackType] = useState('general');
  const [message, setMessage] = useState('This is a test feedback message from admin.');
  const [adminName, setAdminName] = useState('Test Admin');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');

  const handleSendFeedback = async () => {
    setIsLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/admin/send-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorId,
          feedbackType,
          message,
          adminName
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ ${data.message} - Audio notification triggered for: ${data.creatorName}`);
      } else {
        setResult(`❌ Error: ${data.error}`);
      }
      
    } catch (error) {
      setResult('❌ Error sending feedback');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="bg-white/10 backdrop-blur-lg border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Speaker className="w-6 h-6 text-blue-400" />
              Admin Feedback Test
            </CardTitle>
            <CardDescription className="text-gray-300">
              Test sending admin feedback that triggers audio notifications
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Creator ID */}
            <div className="space-y-2">
              <Label htmlFor="creatorId" className="text-white">Creator ID</Label>
              <Input
                id="creatorId"
                value={creatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                placeholder="Enter creator ID"
                className="bg-white/10 border-gray-600 text-white"
              />
            </div>

            {/* Feedback Type */}
            <div className="space-y-2">
              <Label htmlFor="feedbackType" className="text-white">Feedback Type</Label>
              <Select value={feedbackType} onValueChange={setFeedbackType}>
                <SelectTrigger className="bg-white/10 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                  <SelectItem value="issue">Issue Report</SelectItem>
                  <SelectItem value="praise">Praise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Admin Name */}
            <div className="space-y-2">
              <Label htmlFor="adminName" className="text-white">Admin Name</Label>
              <Input
                id="adminName"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Enter admin name"
                className="bg-white/10 border-gray-600 text-white"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message" className="text-white">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter feedback message"
                className="bg-white/10 border-gray-600 text-white min-h-[100px]"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendFeedback}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Feedback & Trigger Audio
                </>
              )}
            </Button>

            {/* Result */}
            {result && (
              <div className="p-4 bg-white/10 rounded-lg border border-gray-600">
                <p className="text-white">{result}</p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-green-500/20 p-4 rounded-lg border border-green-500/30">
              <h3 className="text-white font-semibold mb-2">🎯 How This Works:</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Step 1:</strong> Fill in the form above</li>
                <li>• <strong>Step 2:</strong> Click "Send Feedback & Trigger Audio"</li>
                <li>• <strong>Step 3:</strong> Email will be sent to creator</li>
                <li>• <strong>Step 4:</strong> Audio notification will play: "CreatorName, you have received a new notification from Creator Shield"</li>
                <li>• <strong>Note:</strong> Creator must have audio enabled in settings</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 