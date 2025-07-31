import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth-utils';
import dbConnect from '@/lib/mongodb';
import Creator from '@/models/Creator';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get user from JWT token
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { action, plan } = await req.json();

    if (action === 'request_service') {
      // Get user details
      const user = await Creator.findOne({ email: payload.email }).exec();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Check if user has required plan for legal consultation
      if (plan === 'free') {
        return NextResponse.json({ 
          error: 'Legal Consultation requires a premium plan. Please upgrade to access this service.',
          requiresUpgrade: true
        }, { status: 403 });
      }

      // Process legal consultation request
      // This would typically involve:
      // 1. Analyzing user's legal issues
      // 2. Connecting with legal experts
      // 3. Scheduling consultation sessions
      // 4. Providing legal advice and documentation

      const legalConsultationData = {
        userId: user._id,
        service: 'legal-consultation',
        requestDate: new Date(),
        status: 'processing',
        plan: plan,
        // Mock legal consultation data
        data: {
          consultationType: 'copyright_legal_advice',
          priority: 'medium',
          estimatedResponse: '24-48 hours',
          legalExpert: {
            name: 'Sarah Johnson',
            specialization: 'Intellectual Property Law',
            experience: '15+ years',
            availability: 'Next available: 48 hours'
          },
          consultationAreas: [
            {
              area: 'Copyright Infringement',
              description: 'Review of potential copyright violations in your content',
              priority: 'high'
            },
            {
              area: 'Fair Use Guidelines',
              description: 'Understanding fair use in content creation',
              priority: 'medium'
            },
            {
              area: 'DMCA Compliance',
              description: 'Ensuring proper DMCA compliance procedures',
              priority: 'medium'
            },
            {
              area: 'Content Licensing',
              description: 'Guidance on licensing agreements and permissions',
              priority: 'low'
            }
          ],
          documents: [
            'Copyright Policy Template',
            'DMCA Notice Template',
            'Content Licensing Guide',
            'Fair Use Guidelines'
          ]
        }
      };

      return NextResponse.json({
        success: true,
        message: 'Legal Consultation request submitted successfully. A legal expert will contact you within 24-48 hours.',
        serviceId: `legal_consult_${Date.now()}`,
        estimatedResponse: '24-48 hours',
        consultationType: 'copyright_legal_advice'
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Legal Consultation API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process legal consultation request' 
    }, { status: 500 });
  }
} 