import { getPlanFeatures, getFeatureLimit } from './plan-features';

export interface UsageStats {
  videoMonitoring: number;
  violationDetection: number;
  dmcaRequests: number;
  lastReset: Date;
}

export interface UsageLimit {
  current: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
}

export class UsageTracker {
  private static instance: UsageTracker;
  private usageData: Map<string, UsageStats> = new Map();

  static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  async getUserUsage(userId: string): Promise<UsageStats> {
    // In a real app, this would fetch from database
    const stored = this.usageData.get(userId);
    if (stored) {
      return stored;
    }

    // Initialize with zero usage
    const initialUsage: UsageStats = {
      videoMonitoring: 0,
      violationDetection: 0,
      dmcaRequests: 0,
      lastReset: new Date(),
    };

    this.usageData.set(userId, initialUsage);
    return initialUsage;
  }

  async incrementUsage(userId: string, feature: keyof UsageStats): Promise<void> {
    const usage = await this.getUserUsage(userId);
    if (feature !== 'lastReset') {
      usage[feature]++;
      this.usageData.set(userId, usage);
    }
  }

  async checkUsageLimit(userId: string, userPlan: string, feature: keyof UsageStats): Promise<UsageLimit> {
    const usage = await this.getUserUsage(userId);
    const limit = getFeatureLimit(userPlan, feature as any);
    
    const current = usage[feature];
    const remaining = limit === 'unlimited' ? 'unlimited' : Math.max(0, limit - current);

    return {
      current,
      limit,
      remaining,
    };
  }

  async canUseFeature(userId: string, userPlan: string, feature: keyof UsageStats): Promise<boolean> {
    const usageLimit = await this.checkUsageLimit(userId, userPlan, feature);
    return usageLimit.remaining === 'unlimited' || usageLimit.remaining > 0;
  }

  async getUsageSummary(userId: string, userPlan: string): Promise<Record<string, UsageLimit>> {
    const features: (keyof UsageStats)[] = ['videoMonitoring', 'violationDetection', 'dmcaRequests'];
    const summary: Record<string, UsageLimit> = {};

    for (const feature of features) {
      summary[feature] = await this.checkUsageLimit(userId, userPlan, feature);
    }

    return summary;
  }

  async resetUsage(userId: string): Promise<void> {
    const usage = await this.getUserUsage(userId);
    usage.videoMonitoring = 0;
    usage.violationDetection = 0;
    usage.dmcaRequests = 0;
    usage.lastReset = new Date();
    this.usageData.set(userId, usage);
  }
}

export const usageTracker = UsageTracker.getInstance(); 