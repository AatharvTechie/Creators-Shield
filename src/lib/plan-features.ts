export interface PlanFeatures {
  duration: string;
  supportResponse: string;
  youtubeChannels: boolean;
  videoMonitoring: number | 'unlimited';
  violationDetection: number | 'unlimited';
  dmcaRequests: number | 'unlimited';
  advancedAnalytics: boolean;
  multiPlatformMonitoring: boolean;
  realTimeAlerts: boolean;
  violationHistory: boolean;
  apiAccess: boolean;
  legalConsultation: boolean;
  bulkOperations: boolean;
  predictiveAnalytics: boolean;
  priorityQueueProcessing: boolean;
  customIntegrations: boolean;
  teamManagement: boolean;
  advancedAiProtection: boolean;
  dedicatedAccountManager: boolean;
}

export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  'free-trial': {
    duration: '7 Days',
    supportResponse: '2-3 Days',
    youtubeChannels: true,
    videoMonitoring: 5,
    violationDetection: 5,
    dmcaRequests: 1,
    advancedAnalytics: true,
    multiPlatformMonitoring: true,
    realTimeAlerts: true,
    violationHistory: true,
    apiAccess: true,
    legalConsultation: false,
    bulkOperations: false,
    predictiveAnalytics: false,
    priorityQueueProcessing: true,
    customIntegrations: false,
    teamManagement: false,
    advancedAiProtection: false,
    dedicatedAccountManager: false,
  },
  'monthly': {
    duration: '1 Month',
    supportResponse: '12h',
    youtubeChannels: true,
    videoMonitoring: 20,
    violationDetection: 20,
    dmcaRequests: 20,
    advancedAnalytics: true,
    multiPlatformMonitoring: true,
    realTimeAlerts: true,
    violationHistory: true,
    apiAccess: true,
    legalConsultation: true,
    bulkOperations: false,
    predictiveAnalytics: true,
    priorityQueueProcessing: true,
    customIntegrations: false,
    teamManagement: false,
    advancedAiProtection: false,
    dedicatedAccountManager: false,
  },
  'yearly': {
    duration: '1 Year',
    supportResponse: '7h',
    youtubeChannels: true,
    videoMonitoring: 'unlimited',
    violationDetection: 'unlimited',
    dmcaRequests: 'unlimited',
    advancedAnalytics: true,
    multiPlatformMonitoring: true,
    realTimeAlerts: true,
    violationHistory: true,
    apiAccess: true,
    legalConsultation: true,
    bulkOperations: true,
    predictiveAnalytics: true,
    priorityQueueProcessing: true,
    customIntegrations: true,
    teamManagement: true,
    advancedAiProtection: true,
    dedicatedAccountManager: true,
  },
};

export function getPlanFeatures(plan: string): PlanFeatures {
  return PLAN_FEATURES[plan] || PLAN_FEATURES['free-trial'];
}

export function checkFeatureAccess(plan: string, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(plan);
  return features[feature] === true;
}

export function getFeatureLimit(plan: string, feature: keyof PlanFeatures): number | 'unlimited' {
  const features = getPlanFeatures(plan);
  const value = features[feature];
  return typeof value === 'number' ? value : 'unlimited';
}

export function formatFeatureValue(value: boolean | number | string): string {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === 'unlimited') {
    return 'Unlimited';
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
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
  if (userPlan === 'free-trial') {
    return 'Upgrade to monthly or yearly for longer access and better support';
  }
  if (userPlan === 'monthly') {
    return 'Upgrade to yearly for the best value and dedicated account manager';
  }
  
  return null;
} 