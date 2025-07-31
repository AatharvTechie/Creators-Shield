'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gavel, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Users,
  Shield,
  TrendingUp
} from 'lucide-react';
import { LegalConsultation } from '@/lib/legal-consultation';
import { useDashboardData } from '@/app/dashboard/dashboard-context';
import { useToast } from '@/hooks/use-toast';

export default function LegalConsultationPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCaseForm, setShowNewCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [advice, setAdvice] = useState<any>(null);
  const { toast } = useToast();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;

  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    violationType: 'copyright',
    platform: 'YouTube',
    severity: 'medium'
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setLoading(true);
    try {
      const userCases = await LegalConsultation.getUserCases(user?.email || 'test');
      setCases(userCases);
    } catch (error) {
      console.error('Error loading cases:', error);
      toast({
        title: 'Error',
        description: 'Failed to load legal cases',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewCase = async () => {
    try {
      const caseData = await LegalConsultation.createLegalCase(user?.email || 'test', newCase);
      setCases([...cases, caseData]);
      setShowNewCaseForm(false);
      setNewCase({
        title: '',
        description: '',
        violationType: 'copyright',
        platform: 'YouTube',
        severity: 'medium'
      });
      toast({
        title: 'Case Created',
        description: 'Legal case created successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create legal case',
        variant: 'destructive'
      });
    }
  };

  const getLegalAdvice = async (caseId: string) => {
    try {
      const adviceData = await LegalConsultation.getLegalAdvice(caseId);
      setAdvice(adviceData);
      setSelectedCase(cases.find(c => c.id === caseId));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get legal advice',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'reviewing':
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Reviewing</Badge>;
      case 'advised':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Advised</Badge>;
      case 'resolved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="default" className="bg-green-500">Low</Badge>;
      case 'medium':
        return <Badge variant="default" className="bg-yellow-500">Medium</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-orange-500">High</Badge>;
      case 'critical':
        return <Badge variant="default" className="bg-red-500">Critical</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading legal consultation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Legal Consultation</h1>
          <p className="text-gray-400">Professional legal advice and case management</p>
        </div>
        <Button onClick={() => setShowNewCaseForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Gavel className="w-4 h-4 mr-2" />
          New Case
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{cases.length}</div>
            <p className="text-xs text-muted-foreground">Legal cases</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {cases.filter(c => c.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting advice</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Advised Cases</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {cases.filter(c => c.status === 'advised').length}
            </div>
            <p className="text-xs text-muted-foreground">With legal advice</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {cases.length > 0 ? Math.round((cases.filter(c => c.status === 'resolved').length / cases.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Resolved cases</p>
          </CardContent>
        </Card>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Gavel className="h-5 w-5" />
              Legal Cases
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your legal consultation cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cases.map((caseItem) => (
                <div 
                  key={caseItem.id} 
                  className="p-4 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800/70 transition-colors"
                  onClick={() => getLegalAdvice(caseItem.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">{caseItem.title}</h3>
                    {getStatusBadge(caseItem.status)}
                  </div>
                  <p className="text-sm text-gray-400 mb-2">{caseItem.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{caseItem.platform}</span>
                    {getSeverityBadge(caseItem.severity)}
                    <span className="text-xs text-gray-500">
                      {new Date(caseItem.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              {cases.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Gavel className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No legal cases yet</p>
                  <p className="text-sm">Create your first case to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Legal Advice */}
        {advice && selectedCase && (
          <Card className="bg-white/5 border-gray-600/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Legal Advice
              </CardTitle>
              <CardDescription className="text-gray-400">
                Professional legal analysis and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Case: {selectedCase.title}</h4>
                <p className="text-sm text-gray-400">{selectedCase.description}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-white mb-1">Legal Advice</h5>
                  <p className="text-sm text-gray-300">{advice.advice}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-white mb-1">Recommended Actions</h5>
                  <ul className="space-y-1">
                    {advice.recommendedActions.map((action: string, index: number) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-white mb-1">Estimated Cost</h5>
                    <p className="text-sm text-gray-300">${advice.estimatedCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-white mb-1">Time to Resolution</h5>
                    <p className="text-sm text-gray-300">{advice.timeToResolution}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-white mb-1">Risk Assessment</h5>
                  <p className="text-sm text-gray-300">{advice.riskAssessment}</p>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-white mb-1">Legal Basis</h5>
                  <ul className="space-y-1">
                    {advice.legalBasis.map((basis: string, index: number) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        {basis}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* New Case Form */}
      {showNewCaseForm && (
        <Card className="bg-white/5 border-gray-600/30">
          <CardHeader>
            <CardTitle className="text-white">Create New Legal Case</CardTitle>
            <CardDescription className="text-gray-400">
              Submit a new case for legal consultation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-white">Case Title</label>
              <Input
                value={newCase.title}
                onChange={(e) => setNewCase({...newCase, title: e.target.value})}
                placeholder="Enter case title"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-white">Description</label>
              <Textarea
                value={newCase.description}
                onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                placeholder="Describe your legal issue"
                className="bg-gray-800 border-gray-600 text-white"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-white">Violation Type</label>
                <Select value={newCase.violationType} onValueChange={(value) => setNewCase({...newCase, violationType: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="copyright">Copyright</SelectItem>
                    <SelectItem value="trademark">Trademark</SelectItem>
                    <SelectItem value="defamation">Defamation</SelectItem>
                    <SelectItem value="privacy">Privacy</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white">Platform</label>
                <Select value={newCase.platform} onValueChange={(value) => setNewCase({...newCase, platform: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-white">Severity</label>
                <Select value={newCase.severity} onValueChange={(value) => setNewCase({...newCase, severity: value})}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createNewCase} className="bg-blue-600 hover:bg-blue-700">
                Create Case
              </Button>
              <Button variant="outline" onClick={() => setShowNewCaseForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 