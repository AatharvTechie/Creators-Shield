export interface LegalCase {
  id: string;
  userId: string;
  title: string;
  description: string;
  violationType: 'copyright' | 'trademark' | 'defamation' | 'privacy' | 'other';
  platform: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'advised' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  legalAdvice?: string;
  recommendedActions?: string[];
  estimatedCost?: number;
  timeToResolution?: string;
}

export interface LegalAdvice {
  caseId: string;
  advice: string;
  recommendedActions: string[];
  legalBasis: string[];
  estimatedCost: number;
  timeToResolution: string;
  riskAssessment: string;
  nextSteps: string[];
}

export class LegalConsultation {
  static async createLegalCase(userId: string, caseData: Partial<LegalCase>): Promise<LegalCase> {
    const caseId = `case_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const newCase: LegalCase = {
      id: caseId,
      userId,
      title: caseData.title || 'Legal Consultation Request',
      description: caseData.description || '',
      violationType: caseData.violationType || 'copyright',
      platform: caseData.platform || 'YouTube',
      severity: caseData.severity || 'medium',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // In a real app, this would save to database
    return newCase;
  }

  static async getLegalAdvice(caseId: string): Promise<LegalAdvice> {
    // Mock legal advice generation
    const advice: LegalAdvice = {
      caseId,
      advice: this.generateLegalAdvice(),
      recommendedActions: this.generateRecommendedActions(),
      legalBasis: this.generateLegalBasis(),
      estimatedCost: Math.floor(Math.random() * 2000) + 500, // $500-$2500
      timeToResolution: this.generateTimeToResolution(),
      riskAssessment: this.generateRiskAssessment(),
      nextSteps: this.generateNextSteps(),
    };

    return advice;
  }

  static async getUserCases(userId: string): Promise<LegalCase[]> {
    // Mock user cases
    const cases: LegalCase[] = [
      {
        id: 'case_1',
        userId,
        title: 'Copyright Violation on YouTube',
        description: 'My video content was reuploaded without permission',
        violationType: 'copyright',
        platform: 'YouTube',
        severity: 'high',
        status: 'advised',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        legalAdvice: 'Strong case for DMCA takedown. Evidence is clear.',
        recommendedActions: ['File DMCA takedown', 'Document evidence', 'Monitor for reuploads'],
        estimatedCost: 1500,
        timeToResolution: '2-3 weeks',
      },
      {
        id: 'case_2',
        userId,
        title: 'Trademark Infringement',
        description: 'Someone is using my brand name in their content',
        violationType: 'trademark',
        platform: 'Instagram',
        severity: 'medium',
        status: 'reviewing',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    return cases;
  }

  static async updateCaseStatus(caseId: string, status: LegalCase['status']): Promise<void> {
    // In a real app, this would update the database
    console.log(`Updating case ${caseId} status to ${status}`);
  }

  private static generateLegalAdvice(): string {
    const adviceOptions = [
      'Based on the evidence provided, you have a strong case for legal action. The violation appears to be clear-cut and the platform should respond favorably to a properly filed complaint.',
      'While there are some complexities in this case, the legal framework supports your position. I recommend proceeding with caution and ensuring all documentation is properly prepared.',
      'This case requires careful consideration of fair use principles. While you may have grounds for action, the outcome is less certain and may require negotiation.',
      'The evidence suggests this is a straightforward violation that can be resolved through standard takedown procedures. The legal basis is solid and precedents support your position.',
    ];

    return adviceOptions[Math.floor(Math.random() * adviceOptions.length)];
  }

  private static generateRecommendedActions(): string[] {
    const actionSets = [
      [
        'File immediate DMCA takedown notice',
        'Document all evidence with timestamps',
        'Monitor for reuploads or similar violations',
        'Consider legal action if violation persists',
      ],
      [
        'Send cease and desist letter',
        'Gather additional evidence',
        'Consult with specialized attorney',
        'Prepare for potential litigation',
      ],
      [
        'Attempt direct communication first',
        'Document all interactions',
        'File formal complaint with platform',
        'Consider mediation if appropriate',
      ],
    ];

    return actionSets[Math.floor(Math.random() * actionSets.length)];
  }

  private static generateLegalBasis(): string[] {
    const legalBases = [
      'Copyright Act of 1976, Section 512',
      'Digital Millennium Copyright Act (DMCA)',
      'Fair Use Doctrine Analysis',
      'Platform Terms of Service',
      'International Copyright Treaties',
    ];

    return legalBases.slice(0, Math.floor(Math.random() * 3) + 2);
  }

  private static generateTimeToResolution(): string {
    const timeOptions = [
      '1-2 weeks',
      '2-3 weeks',
      '1-2 months',
      '3-6 months',
      'Immediate (24-48 hours)',
    ];

    return timeOptions[Math.floor(Math.random() * timeOptions.length)];
  }

  private static generateRiskAssessment(): string {
    const riskAssessments = [
      'Low risk with high probability of success. Strong legal basis and clear evidence.',
      'Moderate risk due to potential fair use considerations. Success likely but may require negotiation.',
      'High risk case with uncertain outcome. Complex legal issues may require specialized counsel.',
      'Very low risk with excellent chance of success. Clear violation with strong precedent.',
    ];

    return riskAssessments[Math.floor(Math.random() * riskAssessments.length)];
  }

  private static generateNextSteps(): string[] {
    const nextSteps = [
      'Prepare and file formal complaint within 48 hours',
      'Gather additional evidence and documentation',
      'Schedule consultation with legal specialist',
      'Monitor platform response and follow up as needed',
      'Prepare for potential escalation if initial action fails',
    ];

    return nextSteps.slice(0, Math.floor(Math.random() * 3) + 2);
  }
} 