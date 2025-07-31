'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Zap, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Trash2,
  Play,
  Pause,
  Download,
  Upload
} from 'lucide-react';
import { BulkOperations } from '@/lib/bulk-operations';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useToast } from '@/hooks/use-toast';

export default function BulkOperationsPage() {
  const [operations, setOperations] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showNewOperation, setShowNewOperation] = useState(false);
  const { toast } = useToast();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;

  const [newOperation, setNewOperation] = useState({
    type: 'dmca_bulk',
    urls: '',
    template: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [userOperations, operationTemplates, operationStats] = await Promise.all([
        BulkOperations.getUserBulkOperations(user?.email || 'test'),
        BulkOperations.getBulkOperationTemplates(),
        BulkOperations.getBulkOperationStats(user?.email || 'test')
      ]);
      
      setOperations(userOperations);
      setTemplates(operationTemplates);
      setStats(operationStats);
    } catch (error) {
      console.error('Error loading bulk operations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bulk operations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createBulkOperation = async () => {
    try {
      const urls = newOperation.urls.split('\n').filter(url => url.trim());
      if (urls.length === 0) {
        toast({
          title: 'Error',
          description: 'Please enter at least one URL',
          variant: 'destructive'
        });
        return;
      }

      const operation = await BulkOperations.createBulkOperation(
        user?.email || 'test',
        newOperation.type as any,
        urls
      );

      setOperations([operation, ...operations]);
      setShowNewOperation(false);
      setNewOperation({
        type: 'dmca_bulk',
        urls: '',
        template: ''
      });

      toast({
        title: 'Operation Created',
        description: `Bulk operation started with ${urls.length} items`
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create bulk operation',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="outline"><Play className="w-3 h-3 mr-1" />Processing</Badge>;
      case 'completed':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'dmca_bulk':
        return <FileText className="w-4 h-4" />;
      case 'violation_scan':
        return <AlertTriangle className="w-4 h-4" />;
      case 'content_cleanup':
        return <Trash2 className="w-4 h-4" />;
      case 'platform_monitoring':
        return <Zap className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bulk operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bulk Operations</h1>
          <p className="text-gray-400">Process multiple violations and DMCA requests efficiently</p>
        </div>
        <Button onClick={() => setShowNewOperation(true)} className="bg-blue-600 hover:bg-blue-700">
          <Zap className="w-4 h-4 mr-2" />
          New Operation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Operations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalOperations || 0}</div>
            <p className="text-xs text-muted-foreground">Bulk operations</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Items Processed</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalItemsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">Total items</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Time Saved</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalTimeSaved || 0}h</div>
            <p className="text-xs text-muted-foreground">Hours saved</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Cost Savings</CardTitle>
            <Download className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats?.totalSavings?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Estimated savings</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.averageSuccessRate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Average success</p>
          </CardContent>
        </Card>
      </div>

      {/* Operations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Recent Operations
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your bulk operation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operations.map((operation) => (
                <div key={operation.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(operation.type)}
                      <span className="font-medium text-white">{operation.type.replace('_', ' ').toUpperCase()}</span>
                    </div>
                    {getStatusBadge(operation.status)}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Items:</span>
                      <span className="text-white">{operation.results.totalItems}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Successful:</span>
                      <span className="text-green-400">{operation.results.successful}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Failed:</span>
                      <span className="text-red-400">{operation.results.failed}</span>
                    </div>
                    
                    {operation.status === 'processing' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress:</span>
                          <span className="text-white">{operation.progress}%</span>
                        </div>
                        <Progress value={operation.progress} className="w-full" />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Created:</span>
                      <span className="text-white">{new Date(operation.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {operations.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No bulk operations yet</p>
                  <p className="text-sm">Create your first operation to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Templates */}
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Operation Templates
            </CardTitle>
            <CardDescription className="text-gray-400">
              Pre-configured operation templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <Badge variant="outline">{template.type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setNewOperation({
                        ...newOperation,
                        type: template.type,
                        template: template.id
                      });
                      setShowNewOperation(true);
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Operation Form */}
      {showNewOperation && (
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white">Create Bulk Operation</CardTitle>
            <CardDescription className="text-gray-400">
              Process multiple URLs in a single operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Operation Type</label>
              <Select value={newOperation.type} onValueChange={(value) => setNewOperation({...newOperation, type: value})}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dmca_bulk">Bulk DMCA Requests</SelectItem>
                  <SelectItem value="violation_scan">Cross-Platform Scan</SelectItem>
                  <SelectItem value="content_cleanup">Content Cleanup</SelectItem>
                  <SelectItem value="platform_monitoring">Platform Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-white">URLs (one per line)</label>
              <Textarea
                value={newOperation.urls}
                onChange={(e) => setNewOperation({...newOperation, urls: e.target.value})}
                placeholder="https://youtube.com/watch?v=abc123&#10;https://instagram.com/p/xyz789&#10;https://tiktok.com/@user/video/123"
                className="bg-gray-800 border-gray-600 text-white"
                rows={6}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter one URL per line. The system will automatically detect the platform.
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={createBulkOperation} className="bg-blue-600 hover:bg-blue-700">
                <Play className="w-4 h-4 mr-2" />
                Start Operation
              </Button>
              <Button variant="outline" onClick={() => setShowNewOperation(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 