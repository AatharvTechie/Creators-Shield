'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Eye,
  Target,
  Zap
} from 'lucide-react';
import { AdvancedAnalytics } from '@/lib/advanced-analytics';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useToast } from '@/hooks/use-toast';

export default function AdvancedAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { toast } = useToast();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await AdvancedAnalytics.generateAnalytics(user?.email || 'test', timeRange);
      const predictiveInsights = await AdvancedAnalytics.generatePredictiveInsights(user?.email || 'test');
      
      setAnalytics(analyticsData);
      setInsights(predictiveInsights);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (type: 'summary' | 'detailed' | 'executive') => {
    try {
      const report = await AdvancedAnalytics.generateReport(user?.email || 'test', type);
      
      // Create and download report
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${type}-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Generated',
        description: `${type} report downloaded successfully`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
          <p className="text-gray-400">Comprehensive insights and predictive analysis</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 border border-gray-600 text-white rounded px-3 py-1"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
          <Button onClick={() => generateReport('summary')} size="sm">
            Summary Report
          </Button>
          <Button onClick={() => generateReport('detailed')} size="sm">
            Detailed Report
          </Button>
          <Button onClick={() => generateReport('executive')} size="sm">
            Executive Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Videos</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.totalVideos || 0}</div>
            <p className="text-xs text-muted-foreground">Monitored content</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Violations Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.totalViolations || 0}</div>
            <p className="text-xs text-muted-foreground">Copyright violations</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{analytics?.successRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Takedown success</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Revenue Protected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${analytics?.revenueImpact?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Estimated value</p>
          </CardContent>
        </Card>
      </div>

      {/* Predictive Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-5 w-5" />
              Predictive Insights
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI-powered predictions and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Risk Score</span>
              <div className="flex items-center gap-2">
                <Progress value={insights?.riskScore || 0} className="w-20" />
                <span className="text-sm font-medium text-white">{insights?.riskScore?.toFixed(1) || 0}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Predicted Violations</span>
              <span className="text-sm font-medium text-white">{insights?.predictedViolations || 0}</span>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-300">Recommended Actions:</span>
              <ul className="space-y-1">
                {insights?.recommendedActions?.map((action: string, index: number) => (
                  <li key={index} className="text-xs text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Platform Breakdown
            </CardTitle>
            <CardDescription className="text-gray-400">
              Violations by platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.platformBreakdown && Object.entries(analytics.platformBreakdown).map(([platform, count]: [string, any]) => (
                <div key={platform} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{platform}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(count / Math.max(...Object.values(analytics.platformBreakdown))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-white">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="bg-white/5 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
          <CardDescription className="text-gray-400">
            Performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {analytics?.monthlyTrends?.map((trend: any, index: number) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-white">{trend.month}</div>
                <div className="text-xs text-gray-400">
                  <div>Violations: {trend.violations}</div>
                  <div>DMCA: {trend.dmcaRequests}</div>
                  <div>Success: {trend.successRate.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-white/5 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription className="text-gray-400">
            Advanced AI analysis and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights?.aiInsights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-300">{insight}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 