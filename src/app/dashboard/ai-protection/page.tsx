'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Brain, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Target,
  Settings,
  Eye,
  TrendingUp,
  FileText
} from 'lucide-react';
import { AdvancedAIProtection } from '@/lib/advanced-ai-protection';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useToast } from '@/hooks/use-toast';

export default function AIProtectionPage() {
  const [config, setConfig] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [predictions, setPredictions] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;

  const [newRule, setNewRule] = useState({
    name: '',
    condition: '',
    action: 'flag',
    priority: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configData, statsData, predictionsData] = await Promise.all([
        AdvancedAIProtection.getConfig(),
        AdvancedAIProtection.getProtectionStats(user?.email || 'test'),
        AdvancedAIProtection.predictViolations(user?.email || 'test', 'month')
      ]);
      
      setConfig(configData);
      setStats(statsData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Error loading AI protection data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI protection data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig: any) => {
    try {
      await AdvancedAIProtection.updateConfig(newConfig);
      setConfig({ ...config, ...newConfig });
      toast({
        title: 'Configuration Updated',
        description: 'AI protection settings updated successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive'
      });
    }
  };

  const scanContent = async () => {
    setScanning(true);
    try {
      const results = await AdvancedAIProtection.scanUserContent(user?.email || 'test');
      setScanResults(results);
      toast({
        title: 'Scan Complete',
        description: `Found ${results.violationsFound} violations, prevented ${results.preventedViolations}`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to scan content',
        variant: 'destructive'
      });
    } finally {
      setScanning(false);
    }
  };

  const addCustomRule = async () => {
    try {
      const rule = {
        id: `rule_${Date.now()}`,
        ...newRule,
        enabled: true
      };
      
      await AdvancedAIProtection.addCustomRule(rule);
      setConfig({
        ...config,
        customRules: [...(config.customRules || []), rule]
      });
      
      setNewRule({
        name: '',
        condition: '',
        action: 'flag',
        priority: 1
      });
      
      toast({
        title: 'Rule Added',
        description: 'Custom AI rule added successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add custom rule',
        variant: 'destructive'
      });
    }
  };

  const generateProtectionReport = async () => {
    try {
      const report = await AdvancedAIProtection.generateProtectionReport(user?.email || 'test');
      
      // Create and download report
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-protection-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Report Generated',
        description: 'AI protection report downloaded successfully'
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
          <p className="text-gray-500">Loading AI protection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Protection</h1>
          <p className="text-gray-400">Advanced AI-powered content protection and violation detection</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={scanContent} disabled={scanning} className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            {scanning ? 'Scanning...' : 'Scan Content'}
          </Button>
          <Button onClick={generateProtectionReport} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Protection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Content Scanned</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalScans?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total scans</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Violations Prevented</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.violationsPrevented || 0}</div>
            <p className="text-xs text-muted-foreground">AI prevented</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">AI Accuracy</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.accuracy?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Detection accuracy</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Cost Savings</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats?.costSavings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">AI savings</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure AI protection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">AI Protection Enabled</span>
              <Switch
                checked={config?.enabled}
                onCheckedChange={(checked) => updateConfig({ enabled: checked })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Sensitivity Level</label>
              <Select 
                value={config?.sensitivity} 
                onValueChange={(value) => updateConfig({ sensitivity: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Auto Response</span>
              <Switch
                checked={config?.autoResponse}
                onCheckedChange={(checked) => updateConfig({ autoResponse: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Learning Mode</span>
              <Switch
                checked={config?.learningMode}
                onCheckedChange={(checked) => updateConfig({ learningMode: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Predictive Analysis */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Predictive Analysis
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI predictions and risk assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Risk Level</span>
              <Badge 
                variant={predictions?.riskLevel === 'high' ? 'destructive' : 
                         predictions?.riskLevel === 'medium' ? 'default' : 'secondary'}
              >
                {predictions?.riskLevel?.toUpperCase() || 'LOW'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Predicted Violations</span>
              <span className="text-sm font-medium text-white">{predictions?.predictedCount || 0}</span>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-300">High-Risk Areas:</span>
              <div className="space-y-1">
                {predictions?.hotspots?.map((hotspot: string, index: number) => (
                  <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                    {hotspot}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm text-gray-300">Recommendations:</span>
              <div className="space-y-1">
                {predictions?.recommendations?.map((rec: string, index: number) => (
                  <div key={index} className="text-xs text-gray-400 flex items-center gap-2">
                    <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Rules */}
      <Card className="bg-white/5 border-gray-600/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Custom AI Rules
          </CardTitle>
          <CardDescription className="text-gray-400">
            Create custom rules for AI protection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {config?.customRules?.map((rule: any) => (
              <div key={rule.id} className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">{rule.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{rule.action}</Badge>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={async (checked) => {
                        const updatedRules = config.customRules.map((r: any) => 
                          r.id === rule.id ? { ...r, enabled: checked } : r
                        );
                        await updateConfig({ customRules: updatedRules });
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">Condition: {rule.condition}</p>
                <p className="text-xs text-gray-500">Priority: {rule.priority}</p>
              </div>
            ))}

            <div className="border-t border-gray-600 pt-4">
              <h4 className="font-medium text-white mb-3">Add New Rule</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Input
                  placeholder="Rule name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Input
                  placeholder="Condition"
                  value={newRule.condition}
                  onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Select value={newRule.action} onValueChange={(value) => setNewRule({...newRule, action: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="block">Block</SelectItem>
                    <SelectItem value="flag">Flag</SelectItem>
                    <SelectItem value="notify">Notify</SelectItem>
                    <SelectItem value="auto-dmca">Auto DMCA</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addCustomRule} size="sm">
                  Add Rule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scan Results */}
      {scanResults && (
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Latest Scan Results
            </CardTitle>
            <CardDescription className="text-gray-400">
              Results from the most recent content scan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{scanResults.totalScanned}</div>
                <div className="text-sm text-gray-400">Content Scanned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{scanResults.violationsFound}</div>
                <div className="text-sm text-gray-400">Violations Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{scanResults.preventedViolations}</div>
                <div className="text-sm text-gray-400">Violations Prevented</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 