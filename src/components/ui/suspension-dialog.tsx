'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ShieldBan, Mail, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuspensionDialogProps {
  // Admin context props
  user?: {
    id: string;
    name: string;
    email: string;
    displayName?: string;
  };
  action?: 'suspend' | 'deactivate';
  onAction?: (action: 'suspend' | 'deactivate') => Promise<{ success: boolean; message: string }>;
  onEmailSend?: (emailData: { subject: string; html: string }) => Promise<{ success: boolean; message: string }>;
  onOpenChange?: (open: boolean) => void;
  
  // Login context props
  onClose?: () => void;
  timeRemaining?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  
  // Common props
  isOpen: boolean;
}

const emailTemplates = {
  suspend: {
    friendly: {
      subject: 'Account Temporarily Paused - Creator Shield',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 24px;">🔄 Account Paused</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi <strong>{{creatorName}}</strong>! 👋
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We've temporarily paused your Creator Shield account for 24 hours. This is just a short break to ensure everything runs smoothly for everyone.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>⏰ Duration:</strong> 24 hours<br>
                <strong>📅 Start:</strong> {{suspensionTime}}<br>
                <strong>🔄 Auto-resume:</strong> {{endTime}}
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Don't worry! Your account will automatically resume after this period. If you have any questions, we're here to help! 😊
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Thanks for understanding! 💙<br>
                <strong>Creator Shield Team</strong>
              </p>
            </div>
          </div>
        </div>
      `
    },
    professional: {
      subject: 'Account Suspended - Creator Shield',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Account Suspended</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>{{creatorName}}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your Creator Shield account has been temporarily suspended for 24 hours due to a violation of our platform policies.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>Suspension Details:</strong><br>
                • Duration: 24 hours<br>
                • Start Time: {{suspensionTime}}<br>
                • End Time: {{endTime}}
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              During this suspension period, you will not be able to access your Creator Shield dashboard or use our services.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              If you believe this suspension was issued in error, please contact our support team at 
              <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #2563eb;">creatorshieldcommunity@gmail.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Creator Shield Team</strong><br>
                Protecting creators worldwide
              </p>
            </div>
          </div>
        </div>
      `
    },
    direct: {
      subject: 'Account Suspended - Immediate Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">⚠️ ACCOUNT SUSPENDED</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>{{creatorName}}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your Creator Shield account has been SUSPENDED for 24 hours due to policy violations.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>SUSPENSION ACTIVE:</strong><br>
                • Start: {{suspensionTime}}<br>
                • End: {{endTime}}<br>
                • Duration: 24 hours
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>ACCESS BLOCKED:</strong> You cannot use Creator Shield services during this period.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Contact support immediately if this is an error: 
              <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #dc2626;">creatorshieldcommunity@gmail.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Creator Shield</strong>
              </p>
              </div>
                  </div>
                </div>
      `
    }
  },
  deactivate: {
    friendly: {
      subject: 'Account Deactivated - Creator Shield',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🚫 Account Deactivated</h1>
                  </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Hi <strong>{{creatorName}}</strong>! 👋
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              We've had to deactivate your Creator Shield account due to a serious violation of our platform policies. This is a permanent action that requires manual reactivation.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>⚠️ Important:</strong><br>
                • Account is now deactivated<br>
                • Deactivation Time: {{deactivationTime}}<br>
                • Manual reactivation required
              </p>
                </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              To regain access to your account, you'll need to submit a reactivation request through our platform. We'll review your request and get back to you within 24-48 hours.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              If you have any questions or believe this was an error, please contact us at 
              <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #2563eb;">creatorshieldcommunity@gmail.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                We're here to help! 💙<br>
                <strong>Creator Shield Team</strong>
              </p>
                  </div>
                </div>
              </div>
      `
    },
    professional: {
      subject: 'Account Deactivated - Creator Shield',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Account Deactivated</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Dear <strong>{{creatorName}}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your Creator Shield account has been deactivated due to a serious violation of our platform policies, terms of service, or community guidelines.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>Deactivation Details:</strong><br>
                • Status: Account Deactivated<br>
                • Deactivation Time: {{deactivationTime}}<br>
                • Reactivation: Manual Request Required
              </p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              This action was taken after careful review to maintain the integrity, safety, and quality of our platform for all creators.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              To regain access to your account, you must submit a reactivation request through our platform. Our team will review your request and respond within 24-48 hours.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              If you believe this deactivation was issued in error, please contact our support team at 
              <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #2563eb;">creatorshieldcommunity@gmail.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Creator Shield Team</strong><br>
                Protecting creators worldwide
              </p>
            </div>
          </div>
        </div>
      `
    },
    direct: {
      subject: 'Account Deactivated - Immediate Action Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 24px;">🚫 ACCOUNT DEACTIVATED</h1>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>{{creatorName}}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Your Creator Shield account has been DEACTIVATED due to serious policy violations.
            </p>
            
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #991b1b; font-size: 14px; margin: 0;">
                <strong>DEACTIVATION ACTIVE:</strong><br>
                • Status: Account Deactivated<br>
                • Time: {{deactivationTime}}<br>
                • Reactivation: Manual Required
                </p>
              </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>ACCESS BLOCKED:</strong> You cannot use Creator Shield services until reactivation is approved.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Submit reactivation request through our platform or contact support immediately: 
              <a href="mailto:creatorshieldcommunity@gmail.com" style="color: #dc2626;">creatorshieldcommunity@gmail.com</a>
            </p>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <strong>Creator Shield</strong>
              </p>
            </div>
          </div>
        </div>
      `
    }
  }
};

export function SuspensionDialog({ 
  user, 
  action, 
  onAction, 
  onEmailSend, 
  isOpen, 
  onOpenChange,
  onClose,
  timeRemaining,
  hours,
  minutes,
  seconds
}: SuspensionDialogProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<'friendly' | 'professional' | 'direct'>('professional');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Determine context: admin or login
  const isAdminContext = !!user && !!action && !!onAction && !!onEmailSend && !!onOpenChange;
  const isLoginContext = !!onClose && (timeRemaining !== undefined || hours !== undefined);

  // Debug logging
  console.log(`🔍 SuspensionDialog rendered with:`, { 
    action, 
    isOpen, 
    user: user?.name,
    isAdminContext,
    isLoginContext,
    timeRemaining,
    hours,
    minutes,
    seconds
  });

  // Handle login context (suspension countdown)
  if (isLoginContext) {
    const [countdownTime, setCountdownTime] = useState({
      hours: hours || 0,
      minutes: minutes || 0,
      seconds: seconds || 0
    });

    // Calculate countdown when component mounts or props change
    useEffect(() => {
      if (isOpen && timeRemaining && timeRemaining > 0) {
        const totalSeconds = Math.floor(timeRemaining / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        setCountdownTime({ hours, minutes, seconds });
        
        console.log(`🔍 Countdown initialized:`, { 
          timeRemaining, 
          totalSeconds, 
          hours, 
          minutes, 
          seconds 
        });
      }
    }, [isOpen, timeRemaining]);

    // Update countdown every second
    useEffect(() => {
      if (!isOpen || timeRemaining <= 0) return;

      const timer = setInterval(() => {
        setCountdownTime(prev => {
          let totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds;
          
          if (totalSeconds <= 1) {
            clearInterval(timer);
            return { hours: 0, minutes: 0, seconds: 0 };
          }
          
          totalSeconds -= 1;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;
          
          return { hours, minutes, seconds };
        });
      }, 1000);

      return () => clearInterval(timer);
    }, [isOpen, timeRemaining]);

    const formatTime = (value: number) => {
      return value.toString().padStart(2, '0');
    };

    return (
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose?.()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldBan className="h-5 w-5 text-orange-500" />
              Account Suspended
            </AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been temporarily suspended. Please wait for the suspension to end.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="text-center py-6">
            <div className="text-2xl font-bold text-orange-600 mb-4">
              {formatTime(countdownTime.hours)}:{formatTime(countdownTime.minutes)}:{formatTime(countdownTime.seconds)}
            </div>
            <p className="text-muted-foreground">
              Time remaining until suspension ends
            </p>
          </div>
          <AlertDialogFooter>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Handle admin context (email template selection)
  if (!isAdminContext) {
    console.error(`❌ SuspensionDialog: Invalid props combination. Need either admin context or login context props.`);
    return null;
  }

  // Early return if action is undefined
  if (!action) {
    console.error(`❌ Action is undefined in SuspensionDialog`);
    return null;
  }

  // Safety check for onOpenChange
  if (typeof onOpenChange !== 'function') {
    console.error(`❌ onOpenChange is not a function:`, onOpenChange);
    return null;
  }

  const templates = emailTemplates[action];
  
  // Add error handling for undefined templates
  if (!templates) {
    console.error(`❌ No email templates found for action: ${action}`);
    console.error(`❌ Available actions:`, Object.keys(emailTemplates));
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              Email templates not found for action: {action}. Available actions: {Object.keys(emailTemplates).join(', ')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              console.log(`🔍 Closing dialog via AlertDialogCancel`);
              onOpenChange(false);
            }}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }
  
  const currentTemplate = templates[selectedTemplate];
  
  // Add error handling for undefined current template
  if (!currentTemplate) {
    console.error(`❌ No template found for action: ${action}, template: ${selectedTemplate}`);
    console.error(`❌ Available templates for ${action}:`, Object.keys(templates));
    return (
      <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              Email template not found for {selectedTemplate}. Available templates: {Object.keys(templates).join(', ')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              console.log(`🔍 Closing dialog via AlertDialogCancel`);
              onOpenChange(false);
            }}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const getTemplatePreview = () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    return currentTemplate.html
      .replace(/{{creatorName}}/g, user?.displayName || user?.name || 'User')
      .replace(/{{suspensionTime}}/g, now.toLocaleString())
      .replace(/{{endTime}}/g, endTime.toLocaleString())
      .replace(/{{deactivationTime}}/g, now.toLocaleString());
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      const result = await onEmailSend?.({
        subject: currentTemplate.subject,
        html: getTemplatePreview()
      });
      
      if (result?.success) {
        setEmailSent(true);
        toast({ title: "Email Sent", description: "Notification email sent successfully!" });
      } else {
        toast({ variant: 'destructive', title: "Email Failed", description: result?.message || "Failed to send email" });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to send email" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    setIsLoading(true);
    try {
      const result = await onAction?.(action);
      if (result?.success) {
        toast({ title: "Action Successful", description: result.message });
        onOpenChange?.(false);
      } else {
        toast({ variant: 'destructive', title: "Action Failed", description: result?.message || "Failed to perform action" });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to perform action" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmailAndAction = async () => {
    setIsLoading(true);
    try {
      // Send email first
      const emailResult = await onEmailSend?.({
        subject: currentTemplate.subject,
        html: getTemplatePreview()
      });
      
      if (emailResult?.success) {
        setEmailSent(true);
      }
      
      // Then perform action
      const actionResult = await onAction?.(action);
      if (actionResult?.success) {
        toast({ 
          title: "Success", 
          description: `${action === 'suspend' ? 'Suspension' : 'Deactivation'} completed and email sent!` 
        });
        onOpenChange?.(false);
      } else {
        toast({ variant: 'destructive', title: "Action Failed", description: actionResult?.message || "Failed to complete action" });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: "Failed to complete action" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {action === 'suspend' ? (
              <>
                <ShieldBan className="h-5 w-5 text-orange-500" />
                Suspend Creator: {user?.displayName || user?.name || 'User'}
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Deactivate Creator: {user?.displayName || user?.name || 'User'}
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose an email template and send notification to {user?.email || 'User'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Email Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Template
              </CardTitle>
              <CardDescription>
                Select how you want to communicate this action to the creator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedTemplate} onValueChange={(value) => setSelectedTemplate(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="friendly" className="flex items-center gap-2 text-xs">
                    😊 Friendly
                  </TabsTrigger>
                  <TabsTrigger value="professional" className="flex items-center gap-2 text-xs">
                    👔 Professional
                  </TabsTrigger>
                  <TabsTrigger value="direct" className="flex items-center gap-2 text-xs">
                    ⚡ Direct
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="friendly" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Subject: {templates.friendly.subject}</Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        😊 Warm & Approachable
                      </Badge>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800 font-medium mb-2">Template Style:</p>
                      <ul className="text-xs text-green-700 space-y-1">
                        <li>• Uses friendly emojis and casual language</li>
                        <li>• Emphasizes temporary nature and easy return</li>
                        <li>• Encouraging and supportive tone</li>
                        <li>• Perfect for first-time violations or minor issues</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="professional" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Subject: {templates.professional.subject}</Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        👔 Formal & Detailed
                      </Badge>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800 font-medium mb-2">Template Style:</p>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Professional business communication</li>
                        <li>• Comprehensive information and clear structure</li>
                        <li>• Detailed explanation of policies and procedures</li>
                        <li>• Suitable for serious violations or repeat offenders</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="direct" className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Subject: {templates.direct.subject}</Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        ⚡ Concise & Clear
                      </Badge>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <p className="text-sm text-orange-800 font-medium mb-2">Template Style:</p>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Straightforward and to-the-point</li>
                        <li>• Essential information only</li>
                        <li>• Clear action items and next steps</li>
                        <li>• Ideal for urgent situations or clear violations</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Email Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Preview
              </CardTitle>
              <CardDescription>
                How the email will appear to <span className="font-medium">{user?.email || 'User'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Template: <span className="font-medium capitalize">{selectedTemplate}</span></span>
                  <span className="text-muted-foreground">Recipient: <span className="font-medium">{user?.displayName || user?.name || 'User'}</span></span>
                </div>
                <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto shadow-inner">
                  <div dangerouslySetInnerHTML={{ __html: getTemplatePreview() }} />
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Preview generated at {new Date().toLocaleTimeString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Choose Action
              </CardTitle>
              <CardDescription>
                Select how you want to proceed with this {action === 'suspend' ? 'suspension' : 'deactivation'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleSendEmail}
                  disabled={isLoading || emailSent}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                  <div className="text-center">
                    <div className="font-medium">{emailSent ? 'Email Sent ✓' : 'Send Email Only'}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Only send notification email
                    </div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAction}
                  disabled={isLoading}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldBan className="h-5 w-5" />}
                  <div className="text-center">
                    <div className="font-medium">{action === 'suspend' ? 'Suspend Only' : 'Deactivate Only'}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Only perform the action
                    </div>
                  </div>
                </Button>
                
            <Button 
                  onClick={handleSendEmailAndAction}
                  disabled={isLoading}
                  className="flex items-center gap-2 h-auto p-4 flex-col"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                  <div className="text-center">
                    <div className="font-medium">Send Email & {action === 'suspend' ? 'Suspend' : 'Deactivate'}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Send email and perform action
                    </div>
                  </div>
            </Button>
          </div>
              
              {emailSent && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Email notification sent successfully!</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 