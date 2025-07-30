// Plan-based feature access system
export interface PlanFeatures {
  plan: 'free' | 'monthly' | 'yearly';
  features: {
    // YouTube Channel Limits
    maxYouTubeChannels: number;
    maxVideosToMonitor: number;
    
    // Violation Detection
    maxViolationDetections: number;
    unlimitedViolationDetection: boolean;
    
    // DMCA Requests
    maxDmcaRequests: number;
    unlimitedDmcaRequests: boolean;
    
    // Support
    supportResponseTime: '48h' | '7h' | '1h';
    prioritySupport: boolean;
    dedicatedManager: boolean;
    
    // Analytics & Reports
    advancedAnalytics: boolean;
    pdfReports: boolean;
    scheduledReports: boolean;
    
    // Multi-platform Monitoring
    multiPlatformMonitoring: boolean;
    maxPlatforms: number;
    
    // Real-time Features
    realTimeAlerts: boolean;
    emailTemplates: boolean;
    violationHistory: boolean;
    
    // Advanced Features
    customBranding: boolean;
    apiAccess: boolean;
    legalConsultation: boolean;
    bulkOperations: boolean;
    predictiveAnalytics: boolean;
    priorityQueueProcessing: boolean;
    customIntegrations: boolean;
    teamManagement: boolean;
    
    // AI Features
    advancedAiProtection: boolean;
  };
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  free: {
    plan: 'free',
    features: {
      maxYouTubeChannels: -1, // Unlimited
      maxVideosToMonitor: -1, // Unlimited
      maxViolationDetections: -1, // Unlimited
      unlimitedViolationDetection: true,
      maxDmcaRequests: -1, // Unlimited
      unlimitedDmcaRequests: true,
      supportResponseTime: '48h',
      prioritySupport: false,
      dedicatedManager: false,
      advancedAnalytics: true,
      pdfReports: true,
      scheduledReports: true,
      multiPlatformMonitoring: true,
      maxPlatforms: -1, // All platforms
      realTimeAlerts: true,
      emailTemplates: true,
      violationHistory: true,
      customBranding: true,
      apiAccess: true,
      legalConsultation: true,
      bulkOperations: true,
      predictiveAnalytics: true,
      priorityQueueProcessing: true,
      customIntegrations: true,
      teamManagement: true,
      advancedAiProtection: true,
    }
  },
  monthly: {
    plan: 'monthly',
    features: {
      maxYouTubeChannels: -1, // Unlimited
      maxVideosToMonitor: -1, // Unlimited
      maxViolationDetections: -1, // Unlimited
      unlimitedViolationDetection: true,
      maxDmcaRequests: -1, // Unlimited
      unlimitedDmcaRequests: true,
      supportResponseTime: '7h',
      prioritySupport: true,
      dedicatedManager: false,
      advancedAnalytics: true,
      pdfReports: true,
      scheduledReports: true,
      multiPlatformMonitoring: true,
      maxPlatforms: -1, // All platforms
      realTimeAlerts: true,
      emailTemplates: true,
      violationHistory: true,
      customBranding: true,
      apiAccess: true,
      legalConsultation: true,
      bulkOperations: true,
      predictiveAnalytics: true,
      priorityQueueProcessing: true,
      customIntegrations: true,
      teamManagement: true,
      advancedAiProtection: true,
    }
  },
  yearly: {
    plan: 'yearly',
    features: {
      maxYouTubeChannels: -1, // Unlimited
      maxVideosToMonitor: -1, // Unlimited
      maxViolationDetections: -1, // Unlimited
      unlimitedViolationDetection: true,
      maxDmcaRequests: -1, // Unlimited
      unlimitedDmcaRequests: true,
      supportResponseTime: '7h',
      prioritySupport: true,
      dedicatedManager: true,
      advancedAnalytics: true,
      pdfReports: true,
      scheduledReports: true,
      multiPlatformMonitoring: true,
      maxPlatforms: -1, // All platforms
      realTimeAlerts: true,
      emailTemplates: true,
      violationHistory: true,
      customBranding: true,
      apiAccess: true,
      legalConsultation: true,
      bulkOperations: true,
      predictiveAnalytics: true,
      priorityQueueProcessing: true,
      customIntegrations: true,
      teamManagement: true,
      advancedAiProtection: true,
    }
  }
};

// Feature access check functions
export function hasFeatureAccess(userPlan: string, feature: keyof PlanFeatures['features']): boolean {
  const plan = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free;
  const value = plan.features[feature];
  return value === true || (typeof value === 'number' && value > 0);
}

export function getFeatureLimit(userPlan: string, feature: keyof PlanFeatures['features']): number {
  const plan = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free;
  const value = plan.features[feature];
  return typeof value === 'number' ? value : 0;
}

export function isUnlimited(userPlan: string, feature: keyof PlanFeatures['features']): boolean {
  const plan = PLAN_FEATURES[userPlan] || PLAN_FEATURES.free;
  const value = plan.features[feature];
  return value === -1 || value === true;
}

// Dashboard feature access - All plans have access to all features
export const DASHBOARD_FEATURES = {
  // All features available for all plans
  ALL_FEATURES: [
    'overview',
    'activity',
    'analytics',
    'content',
    'monitoring',
    'violations',
    'reports',
    'settings',
    'team',
    'integrations'
  ]
};

export function canAccessDashboardFeature(userPlan: string, feature: string): boolean {
  // All plans have access to all dashboard features
  return DASHBOARD_FEATURES.ALL_FEATURES.includes(feature);
}

// Usage tracking
export interface UsageStats {
  youtubeChannels: number;
  videosMonitored: number;
  violationDetections: number;
  dmcaRequests: number;
  platformsConnected: number;
}

export function checkUsageLimit(userPlan: string, currentUsage: UsageStats): {
  canAddYouTubeChannel: boolean;
  canAddVideo: boolean;
  canDetectViolation: boolean;
  canSubmitDmca: boolean;
  canAddPlatform: boolean;
} {
  // All plans have unlimited access to all features
  return {
    canAddYouTubeChannel: true,
    canAddVideo: true,
    canDetectViolation: true,
    canSubmitDmca: true,
    canAddPlatform: true,
  };
}

// Plan upgrade suggestions - All plans have all features, so no upgrade suggestions needed
export function getUpgradeSuggestion(userPlan: string, usage: UsageStats): string | null {
  // All plans have unlimited access to all features
  // Users can upgrade for longer duration or better support response time
  if (userPlan === 'free') {
    return 'Upgrade to monthly or yearly for longer access and better support';
  }
  if (userPlan === 'monthly') {
    return 'Upgrade to yearly for the best value and dedicated account manager';
  }
  
  return null;
} 