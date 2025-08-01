
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { LogOut, Trash2, Download, RefreshCcw, Info, Settings, Shield, MessageSquare, Clock, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useDashboardData, useDashboardRefresh, useDashboardLoading } from '@/app/dashboard/dashboard-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { useRef } from 'react';
import bcrypt from 'bcryptjs';
import { InteractiveLoader } from '@/components/ui/loader';
import { PlanCard } from '@/components/settings/plan-card';

type MostViewedVideo = { id: string; title: string; thumbnail: string; url: string; viewCount: string };
type YoutubeChannel = { id: string; title: string; thumbnail: string; url: string; subscriberCount?: string; viewCount?: string; mostViewedVideo?: MostViewedVideo | null };
type Device = { 
  id: string; 
  device: string; 
  browser: string;
  os: string;
  ipAddress: string;
  userAgent: string; 
  createdAt: string; 
  lastActive: string;
  isCurrentSession: boolean;
};

export default function SettingsPage() {
  const [theme, setTheme] = useState('system');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('creator@email.com');
  const [phone, setPhone] = useState('');
  const [twoFA, setTwoFA] = useState(false);
  const [twoFASetup, setTwoFASetup] = useState(false);
  const [twoFAQR, setTwoFAQR] = useState('');
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dangerLoading, setDangerLoading] = useState({ export: false, reset: false, delete: false });
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [youtubeChannelId, setYoutubeChannelId] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState<YoutubeChannel | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [youtubeError, setYoutubeError] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();
  const router = useRouter();
  const { setTheme: setThemeNext, theme: currentTheme } = useTheme();
  const dashboardData = useDashboardData();
  const user = dashboardData?.user;
  const profileName = user?.youtubeChannel?.title || user?.displayName || user?.name || 'Creator';
  const profileAvatar = user?.avatar || '/default-avatar.png';
  const dashboardRefresh = useDashboardRefresh();
  const [connectingNewChannel, setConnectingNewChannel] = useState(false);
  const [waitingForDashboard, setWaitingForDashboard] = useState<string | null>(null);
  const dashboardLoading = useDashboardLoading();



  // Track changes for enabling Save button
  useEffect(() => {
    setHasChanged(true);
  }, [theme, fullName]);

  // Auto-fill name and email from user when available
  useEffect(() => {
    if (user) {
      setFullName(user.displayName || user.name || '');
      setEmail(user.email || '');
      setEmailInput(user.email || '');
      setAccountLoading(false);
    }
  }, [user]);

  // Real devices list
  const [devices, setDevices] = useState<Device[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState('');
  const [securityChanged, setSecurityChanged] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [bellRinging, setBellRinging] = useState(false);
  const [newDeviceNotification, setNewDeviceNotification] = useState<string | null>(null);

  // Bell notification effect
  useEffect(() => {
    if (bellRinging) {
      const timer = setTimeout(() => {
        setBellRinging(false);
        setNewDeviceNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bellRinging]);

  // Check for new devices and trigger notifications
  useEffect(() => {
    if (devices.length > 0) {
      const newDevices = devices.filter(device => {
        const deviceTime = new Date(device.createdAt).getTime();
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        return deviceTime > fiveMinutesAgo && !device.isCurrentSession;
      });

      if (newDevices.length > 0) {
        setBellRinging(true);
        setNewDeviceNotification(`New device logged in: ${newDevices[0].device}`);
        
        // Send email notification
        sendNewDeviceEmail(newDevices[0]);
      }
    }
  }, [devices]);

  const sendNewDeviceEmail = async (device: Device) => {
    try {
      const response = await fetch('/api/settings/new-device-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user?.email,
          deviceInfo: {
            device: device.device,
            browser: device.browser,
            os: device.os,
            ipAddress: device.ipAddress,
            loginTime: device.createdAt
          }
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send new device email');
      }
    } catch (error) {
      console.error('Error sending new device email:', error);
    }
  };

  // Notification Settings state
  const [notificationSettings, setNotificationSettings] = useState({
    newCopyrightMatches: true,
    weeklyReports: true,
    promotionalEmails: false
  });
  const [notificationSaving, setNotificationSaving] = useState(false);

  // Subscription & Billing state
  const [subscription, setSubscription] = useState({
    plan: user?.plan || 'free',
    status: 'active',
    nextBillingDate: (() => {
      if (!user?.planExpiry || user?.plan === 'free') return 'No billing date';
      const expiryDate = new Date(user.planExpiry);
      const now = new Date();
      if (expiryDate <= now) return 'Expired';
      
      // Calculate next billing date based on plan type
      if (user.plan === 'monthly') {
        const nextDate = new Date(expiryDate);
        nextDate.setMonth(nextDate.getMonth() + 1);
        return nextDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      } else if (user.plan === 'yearly') {
        const nextDate = new Date(expiryDate);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        return nextDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
      return expiryDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    })(),
    amount: user?.plan === 'free' ? '$0.00' : user?.plan === 'monthly' ? '$70.00' : user?.plan === 'yearly' ? '$500.00' : '$0.00'
  });
  
  // Calculate purchase date and create invoice history
  const purchaseDate = user?.planExpiry ? (() => {
    const expiryDate = new Date(user.planExpiry);
    if (user.plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() - 1);
    } else if (user.plan === 'yearly') {
      expiryDate.setFullYear(expiryDate.getFullYear() - 1);
    }
    return expiryDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  })() : 'No purchase history';
  
  const [invoices, setInvoices] = useState([
    { 
      id: '1', 
      date: purchaseDate, 
      amount: user?.plan === 'free' ? '$0.00' : user?.plan === 'monthly' ? '$70.00' : user?.plan === 'yearly' ? '$500.00' : '$0.00', 
      status: 'paid',
      description: user?.plan === 'free' ? 'Free Plan' : `${(user?.plan || '').charAt(0).toUpperCase() + (user?.plan || '').slice(1)} Plan Purchase`
    }
  ]);

  // Sync YouTube channel state with dashboardData.user
  useEffect(() => {
    if (user?.youtubeChannelId && user?.youtubeChannel) {
      setYoutubeChannelId(user.youtubeChannelId);
      setYoutubeChannel({
        ...user.youtubeChannel,
        url: (user.youtubeChannel as any).url || ''
      });
    } else {
      setYoutubeChannelId('');
      setYoutubeChannel(null);
    }
  }, [user?.youtubeChannelId, user?.youtubeChannel]);

  // Sync 2FA enabled state with backend
  useEffect(() => {
    if (user && typeof user.twoFactorEnabled === 'boolean') {
      setTwoFAEnabled(user.twoFactorEnabled);
    }
  }, [user]);

  // Only reset 2FA setup form when the user changes
  useEffect(() => {
    setTwoFASetup(false);
    setTwoFACode('');
    setTwoFAQR('');
    setTwoFASecret('');
    setTwoFAError('');
  }, [user]);

  // Fetch real devices on mount
  useEffect(() => {
    if (user?.email) {
      setDevicesLoading(true);
      fetch(`/api/settings/devices?email=${user.email}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('creator_jwt')}`,
          'Content-Type': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.devices) {
          setDevices(data.devices || []);
          } else {
            setDevicesError(data.error || 'Failed to load devices');
          }
          setDevicesLoading(false);
        })
        .catch(() => {
          setDevicesError('Failed to load devices');
          setDevicesLoading(false);
        });
    }
  }, [user?.email]);

  // Track changes for enabling Security Save button
  useEffect(() => {
    setSecurityChanged(true);
  }, [phone, twoFA]);


  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const passwordInputRef = useRef(null);
  const [twoFASetupMode, setTwoFASetupMode] = useState<null | 'setup' | 'disable'>(null);
  const [verificationStep, setVerificationStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [emailInput, setEmailInput] = useState(user?.email || email || '');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [canReset, setCanReset] = useState(false);
  const [newPassword2, setNewPassword2] = useState('');

  // Show loader after login and after channel connect, until all dashboard data is loaded
  if (dashboardLoading || connectingNewChannel) {
    const messages = connectingNewChannel 
      ? [
          "Connecting your YouTube channel...",
          "Verifying channel access...",
          "Loading channel data...",
          "Setting up monitoring..."
        ] 
      : [
          "Loading your dashboard data...",
          "Preparing settings...",
          "Loading user preferences...",
          "Almost ready..."
        ];
    return (
      <InteractiveLoader 
        show={true} 
        messages={messages}
        type={connectingNewChannel ? "processing" : "default"}
        showProgress={true}
        progress={connectingNewChannel ? 85 : 70}
      />
    );
  }

  return (
    <div className="min-h-screen w-full px-2 md:px-0">
      <div className="max-w-4xl mx-auto pt-2 sm:pt-4 pb-4">
        {/* Compact Profile summary card */}
        <div className="flex items-center gap-3 sm:gap-4 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur border border-border/50 shadow-xl rounded-2xl px-4 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-6 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <img src={youtubeChannel && youtubeChannel.thumbnail ? youtubeChannel.thumbnail : profileAvatar} alt="Avatar" className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-primary/40 shadow-lg ring-2 ring-primary/20" />
              {youtubeChannel && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
              <span className="text-lg sm:text-xl font-bold text-primary">{profileName}</span>
                {youtubeChannel && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 font-semibold border border-green-500/30">
                    YouTube Connected
                  </span>
                )}
            </div>
              <div className="text-muted-foreground text-sm flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {email}
          </div>
        </div>
          </div>
        </div>
        {/* Optimized grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* General Section */}
          <div className="bg-card/80 backdrop-blur border border-primary/30 shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              General Settings
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="block mb-2 font-medium text-sm">{t('Theme')}</label>
                <div className="flex gap-2 flex-wrap">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => { setTheme('light'); setThemeNext('light'); }} className="text-xs h-8">{t('Light') || 'Light'}</Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => { setTheme('dark'); setThemeNext('dark'); }} className="text-xs h-8">{t('Dark') || 'Dark'}</Button>
                  <Button variant={theme === 'system' ? 'default' : 'outline'} onClick={() => { setTheme('system'); setThemeNext('system'); }} className="text-xs h-8">{t('System') || 'System'}</Button>
                </div>
              </div>
              <Button
                className="mt-2 text-sm h-9"
                disabled={!hasChanged || isSaving}
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    const res = await fetch('/api/save-user', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        name: fullName,
                        theme,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: t('Profile updated') || 'Profile updated', description: t('Your settings have been saved.') || 'Your settings have been saved.' });
                      setHasChanged(false);
                    } else {
                      toast({ title: t('Error') || 'Error', description: data.error || t('Failed to update profile') || 'Failed to update profile', variant: 'destructive' });
                    }
                  } catch (err) {
                    toast({ title: t('Error') || 'Error', description: t('Failed to update profile') || 'Failed to update profile', variant: 'destructive' });
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? t('Saving...') || 'Saving...' : t('Save Changes')}
              </Button>
            </div>
          </div>
          {/* Account Section */}
          <div className="bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Settings
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="block mb-2 font-medium text-sm">{t('Legal Full Name')}</label>
                {accountLoading ? (
                  <div className="h-9 bg-muted rounded animate-pulse w-full" />
                ) : (
                  <Input value={fullName} readOnly className="opacity-70 cursor-not-allowed text-sm h-9" />
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">{t('Email')}</label>
                {accountLoading ? (
                  <div className="h-9 bg-muted rounded animate-pulse w-full" />
                ) : (
                  <Input value={email} readOnly className="opacity-70 cursor-not-allowed text-sm h-9" />
                )}
              </div>
              <div>
                <label className="block mb-2 font-medium text-sm">{t('Password')}</label>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-sm h-9">{t('Change Password')}</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card shadow-2xl border border-border rounded-2xl p-0 max-w-lg animate-fade-in">
                    {/* Enhanced Stepper */}
                    <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-8 pb-4">
                      <div className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${verificationStep==='email' ? 'border-primary bg-primary/20 text-primary shadow-lg' : 'border-border bg-muted text-muted-foreground'}`}>
                          <span className="text-sm font-medium">1</span>
                      </div>
                        <span className="text-xs mt-2 font-medium">Email</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${verificationStep==='otp' || verificationStep==='reset' ? 'bg-primary' : 'bg-border'}`} />
                      <div className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${verificationStep==='otp' || verificationStep==='reset' ? 'border-primary bg-primary/20 text-primary shadow-lg' : 'border-border bg-muted text-muted-foreground'}`}>
                          <span className="text-sm font-medium">2</span>
                      </div>
                        <span className="text-xs mt-2 font-medium">OTP</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${verificationStep==='reset' ? 'bg-primary' : 'bg-border'}`} />
                      <div className="flex-1 flex flex-col items-center">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${verificationStep==='reset' ? 'border-primary bg-primary/20 text-primary shadow-lg' : 'border-border bg-muted text-muted-foreground'}`}>
                          <span className="text-sm font-medium">3</span>
                      </div>
                        <span className="text-xs mt-2 font-medium">New Password</span>
                    </div>
                    </div>
                    <DialogHeader className="px-6 sm:px-8 pt-4 pb-2">
                      <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-bold">
                        {verificationStep === 'reset' && passwordSuccess ? (
                          <span className="inline-flex items-center text-green-600">
                            <svg className="w-7 h-7 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Password Changed Successfully!
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Change Password
                          </span>
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-base text-muted-foreground">
                        {verificationStep === 'email' && (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            For your security, please verify your email before changing your password.
                          </span>
                        )}
                        {verificationStep === 'otp' && (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Enter the 6-digit OTP sent to your email address.
                          </span>
                        )}
                        {verificationStep === 'reset' && !passwordSuccess && (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Set a new secure password for your account.
                          </span>
                        )}
                        {verificationStep === 'reset' && passwordSuccess && (
                          <span className="flex items-center gap-2 text-green-600">
                            Your password has been changed successfully. Please use your new password next time you log in.
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    {/* Step 1: Email */}
                    {verificationStep === 'email' && (
                      <div className="space-y-4 px-8 py-6 animate-fade-in">
                        <label className="block text-sm font-medium mb-1" htmlFor="change-email"><span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Email Address</span></label>
                        <Input
                          id="change-email"
                          aria-label="Your email address"
                          placeholder="Your email address"
                          value={emailInput}
                          readOnly
                          className="bg-muted border-border text-muted-foreground cursor-not-allowed"
                        />
                        <p className="text-xs text-muted-foreground">Your email address cannot be changed for security reasons.</p>
                        <div className="flex justify-end gap-2 mt-2">
                          <DialogClose asChild>
                            <Button type="button" variant="ghost" className="rounded-md" disabled={isSending}>Cancel</Button>
                          </DialogClose>
                          <Button
                            onClick={async () => {
                              setIsSending(true);
                              setVerificationError('');
                              try {
                                const res = await fetch('/api/send-email-otp', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: user?.email || emailInput }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setVerificationStep('otp');
                                } else {
                                  setVerificationError(data.error || 'Failed to send OTP.');
                                }
                              } catch (err) {
                                setVerificationError('Failed to send OTP.');
                              } finally {
                                setIsSending(false);
                              }
                            }}
                            disabled={isSending}
                            className="rounded-md"
                          >
                            {isSending ? 'Sending...' : 'Send OTP'}
                          </Button>
                        </div>
                        {verificationError && <div className="flex items-center gap-1 text-destructive text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>{verificationError}</div>}
                      </div>
                    )}
                    {/* Step 2: OTP */}
                    {verificationStep === 'otp' && (
                      <div className="space-y-4 px-8 py-6 animate-fade-in">
                        <label className="block text-sm font-medium mb-1" htmlFor="change-otp"><span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>OTP</span></label>
                        <Input
                          id="change-otp"
                          aria-label="Enter 6-digit OTP"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          maxLength={6}
                          className="bg-background border-border focus:border-primary tracking-widest text-lg text-center"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            onClick={async () => {
                              setIsVerifying(true);
                              setVerificationError('');
                              try {
                                const res = await fetch('/api/verify-email-otp', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: user?.email || emailInput, otp }),
                                });
                                const data = await res.json();
                                if (data.success) {
                                  setCanReset(true);
                                  setVerificationStep('reset');
                                } else {
                                  setVerificationError(data.error || 'Invalid OTP.');
                                }
                              } catch (err) {
                                setVerificationError('Failed to verify OTP.');
                              } finally {
                                setIsVerifying(false);
                              }
                            }}
                            disabled={isVerifying || otp.length !== 6}
                            className="rounded-md"
                          >
                            {isVerifying ? 'Verifying...' : 'Verify OTP'}
                          </Button>
                        </div>
                        {verificationError && <div className="flex items-center gap-1 text-destructive text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>{verificationError}</div>}
                      </div>
                    )}
                    {/* Step 3: New Password */}
                    {verificationStep === 'reset' && canReset && !passwordSuccess && (
                      <form onSubmit={async e => {
                        e.preventDefault();
                        setPasswordLoading(true);
                        setPasswordError('');
                        setPasswordSuccess('');
                        try {
                          if (!newPassword2 || newPassword2.length < 8 || !/[A-Za-z]/.test(newPassword2) || !/\d/.test(newPassword2)) {
                            setPasswordError('Password must be at least 8 characters and alphanumeric.');
                            setPasswordLoading(false);
                            return;
                          }
                          const hashed = await bcrypt.hash(newPassword2, 10);
                          const res = await fetch('/api/save-user', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: user?.email || emailInput, password: hashed }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            setPasswordSuccess('Password updated successfully. Please use your new password next time you log in.');
                            setNewPassword2('');
                          } else {
                            setPasswordError(data.error || 'Failed to update password.');
                          }
                        } catch (err) {
                          setPasswordError('Failed to update password.');
                        } finally {
                          setPasswordLoading(false);
                        }
                      }} className="space-y-4 px-8 py-6 animate-fade-in" aria-label="Set new password">
                        <label className="block text-sm font-medium mb-1" htmlFor="change-password"><span className="inline-flex items-center gap-1"><svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17v-6m0 0V7m0 4h.01" /></svg>New Password</span></label>
                        <Input
                          id="change-password"
                          type="password"
                          aria-label="Enter new password"
                          placeholder="Enter new password"
                          value={newPassword2}
                          onChange={e => setNewPassword2(e.target.value)}
                          minLength={8}
                          required
                          className="bg-background border-border focus:border-primary"
                        />
                        {/* Password Strength Meter */}
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full transition-all duration-300 ${newPassword2.length === 0 ? 'w-0' : newPassword2.length < 8 ? 'w-1/4 bg-destructive' : /[A-Za-z]/.test(newPassword2) && /\d/.test(newPassword2) && newPassword2.length >= 12 ? 'w-full bg-green-500' : 'w-2/3 bg-yellow-400'}`}
                          />
                        </div>
                        {passwordError && <div className="flex items-center gap-1 text-destructive text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>{passwordError}</div>}
                        {passwordSuccess && <div className="flex items-center gap-1 text-green-700 text-sm"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>{passwordSuccess}</div>}
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="ghost" className="rounded-md" disabled={passwordLoading}>Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={passwordLoading} aria-label="Save new password" className="rounded-md">
                            {passwordLoading ? 'Saving...' : 'Save Password'}
                          </Button>
                        </DialogFooter>
                      </form>
                    )}
                    {/* Step 3: Success State */}
                    {verificationStep === 'reset' && passwordSuccess && (
                      <div className="flex flex-col items-center justify-center py-8 animate-fade-in">
                        <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        <div className="text-green-700 font-semibold text-lg mb-2">Password Changed!</div>
                        <div className="text-muted-foreground text-sm mb-4">Your password has been updated successfully.</div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="default" className="rounded-md">Close</Button>
                          </DialogClose>
                        </DialogFooter>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          {/* Security Section */}
          <div className="bg-card/80 backdrop-blur border border-border shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-yellow-500 to-yellow-400 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Settings
            </h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div>
                <label className="block mb-1 font-medium text-xs sm:text-sm">Phone Number</label>
                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Add or update phone number" className="text-sm h-8" />
              </div>
              <div>
                <span className="font-medium text-xs sm:text-sm">Two-Factor Authentication</span>
                {twoFAEnabled ? (
                  <div className="mt-2">
                    <div className="text-green-600 font-medium mb-1 text-xs sm:text-sm">2FA is enabled</div>
                    <Button
                      variant="outline"
                      className="mb-1 text-xs sm:text-sm h-7"
                      onClick={() => {
                        setTwoFASetupMode('disable');
                        setTwoFACode('');
                        setTwoFAError('');
                      }}
                      disabled={twoFALoading}
                    >
                      Disable 2FA
                    </Button>
                    {twoFASetupMode === 'disable' && (
                      <form
                        key="disable"
                        className="flex flex-col gap-2 mt-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          setTwoFALoading(true);
                          setTwoFAError('');
                          try {
                            const res = await fetch('/api/settings/2fa/disable', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email, code: twoFACode }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setTwoFAEnabled(false);
                              setTwoFASetupMode(null);
                              setTwoFACode('');
                              toast({ title: '2FA Disabled', description: 'Two-factor authentication has been disabled.' });
                            } else {
                              setTwoFAError(data.error || 'Invalid code');
                            }
                          } catch {
                            setTwoFAError('Failed to disable 2FA');
                          } finally {
                            setTwoFALoading(false);
                          }
                        }}
                      >
                        <Input
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-32 text-xs sm:text-sm h-7"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={twoFALoading} variant="destructive" className="text-xs sm:text-sm h-7">
                            {twoFALoading ? 'Disabling...' : 'Confirm Disable'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setTwoFASetupMode(null)} disabled={twoFALoading} className="text-xs sm:text-sm h-7">Cancel</Button>
                        </div>
                        {twoFAError && <div className="text-destructive text-sm">{twoFAError}</div>}
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!phone || phone.trim().length < 8) {
                          setTwoFAError('Please provide a valid phone number before enabling 2FA.');
                          return;
                        }
                        setTwoFALoading(true);
                        setTwoFAError('');
                        try {
                          const res = await fetch('/api/settings/2fa/setup', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email, phone }),
                          });
                          const data = await res.json();
                          setTwoFAQR(data.qr);
                          setTwoFASecret(data.secret);
                          setTwoFASetupMode('setup');
                          setTwoFACode('');
                          setTwoFAError('');
                        } catch {
                          setTwoFAError('Failed to start 2FA setup');
                        } finally {
                          setTwoFALoading(false);
                        }
                      }}
                      disabled={twoFALoading}
                      className="text-xs sm:text-sm h-8"
                    >
                      Set up 2FA
                    </Button>
                    {(!phone || phone.trim().length < 8) && (
                      <div className="text-destructive text-xs sm:text-sm mt-1">Please enter your phone number above before enabling 2FA.</div>
                    )}
                    {twoFASetupMode === 'setup' && (
                      <form
                        key="setup"
                        className="flex flex-col gap-2 mt-2"
                        onSubmit={async e => {
                          e.preventDefault();
                          setTwoFALoading(true);
                          setTwoFAError('');
                          try {
                            const res = await fetch('/api/settings/2fa/verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email, code: twoFACode }),
                            });
                            const data = await res.json();
                            if (data.success) {
                              setTwoFAEnabled(true);
                              setTwoFASetupMode(null);
                              setTwoFACode('');
                              toast({ title: '2FA Enabled', description: 'Two-factor authentication is now enabled.' });
                            } else {
                              setTwoFAError(data.error || 'Invalid code');
                            }
                          } catch {
                            setTwoFAError('Failed to enable 2FA');
                          } finally {
                            setTwoFALoading(false);
                          }
                        }}
                      >
                        {twoFAQR && (
                          <img src={twoFAQR} alt="2FA QR Code" className="w-32 h-32 mb-2 border rounded" />
                        )}
                        <Input
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-32 text-xs sm:text-sm h-8"
                          required
                        />
                        <div className="flex gap-2">
                          <Button type="submit" disabled={twoFALoading} className="text-xs sm:text-sm h-8">
                            {twoFALoading ? 'Enabling...' : 'Verify & Enable'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setTwoFASetupMode(null)} disabled={twoFALoading} className="text-xs sm:text-sm h-8">Cancel</Button>
                        </div>
                        {twoFAError && <div className="text-destructive text-xs sm:text-sm">{twoFAError}</div>}
                      </form>
                    )}
                  </div>
                )}
              </div>
              <Button
                className="mt-4 text-sm sm:text-base"
                disabled={!securityChanged || securitySaving}
                onClick={async () => {
                  setSecuritySaving(true);
                  try {
                    const res = await fetch('/api/settings/security', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        email,
                        phone,
                        twoFactorEnabled: twoFA,
                      }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: 'Security updated', description: 'Your security settings have been saved.' });
                      setSecurityChanged(false);
                    } else {
                      toast({ title: 'Error', description: data.error || 'Failed to update security settings', variant: 'destructive' });
                    }
                  } catch (err) {
                    toast({ title: 'Error', description: 'Failed to update security settings', variant: 'destructive' });
                  } finally {
                    setSecuritySaving(false);
                  }
                }}
              >
                {securitySaving ? 'Saving...' : 'Save Changes'}
              </Button>

            </div>
          </div>



          {/* Divider before Danger Zone */}
          <div className="col-span-2 my-2">
            <div className="border-t border-destructive/30 w-full" />
          </div>
          {/* Logged-in Devices Section - horizontal layout */}
          <div className="md:col-span-3 bg-card/80 backdrop-blur border border-blue-500/30 shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active Devices
              <div className="relative">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors" 
                     onClick={() => setBellRinging(false)}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z"/>
                  </svg>
                  {bellRinging && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  )}
                </div>
                {bellRinging && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>
            </h2>
            <div className="space-y-3">
                {devicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-muted-foreground">Loading devices...</span>
                </div>
                ) : devicesError ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-destructive font-medium">{devicesError}</div>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-muted-foreground mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-muted-foreground font-medium">No Active Devices</div>
                  <p className="text-sm text-muted-foreground mt-2">Devices will appear here when you log in from different browsers or devices.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {devices.map(device => (
                    <div key={device.id} className={`bg-muted/50 border border-border rounded-lg p-3 hover:bg-muted/70 transition-colors duration-200 ${device.isCurrentSession ? 'ring-2 ring-blue-500/50 bg-blue-500/10' : ''}`}>
                      <div className="flex items-start justify-between">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="font-medium text-xs sm:text-sm truncate flex items-center gap-2">
                              {device.device || 'Unknown Device'}
                              {device.isCurrentSession && (
                                <span className="px-1.5 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                                  Current
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            {device.isCurrentSession ? (
                              <>
                                <div>
                                 Login time: {device.createdAt ? new Date(device.createdAt).toLocaleString() : 'Unknown'}
                               </div>
                                <div>
                                 Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Unknown'}
                               </div>
                              </>
                            ) : (
                              <div>
                                Last active: {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Unknown'}
                              </div>
                            )}
                       </div>
                        </div>
                        {!device.isCurrentSession && (
                       <Button
                         size="sm"
                         variant="outline"
                            className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 h-7"
                         onClick={async () => {
                           try {
                             const res = await fetch('/api/settings/devices', {
                               method: 'DELETE',
                                  headers: { 
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${localStorage.getItem('creator_jwt')}`
                                  },
                                  body: JSON.stringify({ email: user?.email, sessionId: device.id }),
                             });
                             const data = await res.json();
                             if (data.success) {
                               setDevices(devices.filter(d => d.id !== device.id));
                               toast({ title: 'Device revoked', description: `Device has been revoked.` });
                             } else {
                               toast({ title: 'Error', description: data.error || 'Failed to revoke device', variant: 'destructive' });
                             }
                           } catch (error) {
                             toast({ title: 'Error', description: 'Failed to revoke device', variant: 'destructive' });
                           }
                         }}
                       >
                         Revoke
                       </Button>
                        )}
                        {device.isCurrentSession && (
                          <div className="text-xs text-blue-400 font-medium">
                            This device
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="text-xs text-muted-foreground text-center pt-3 border-t border-border">
                Only real logged-in devices are shown. Devices are tracked when you log in from different browsers or devices.
                </div>
              </div>
          </div>



          {/* Notification Settings Section */}
          <div className="col-span-1 md:col-span-3 bg-card/80 backdrop-blur border border-blue-500/30 shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden mt-2">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-blue-500 to-blue-400 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-500" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">New Copyright Matches</div>
                      <div className="text-xs text-muted-foreground">Get notified when new copyright matches are found</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notificationSaving && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                    <Switch
                      checked={notificationSettings.newCopyrightMatches}
                      onCheckedChange={(checked) => {
                        setNotificationSettings(prev => ({ ...prev, newCopyrightMatches: checked }));
                        setNotificationSaving(true);
                        // Simulate API call
                        setTimeout(() => {
                          setNotificationSaving(false);
                          toast({ title: 'Settings updated', description: 'Notification preferences saved successfully.' });
                        }, 1000);
                      }}
                      className="data-[state=checked]:bg-blue-500"
                    />
            </div>
          </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">Weekly Reports</div>
                      <div className="text-xs text-muted-foreground">Receive weekly summary of your content protection</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notificationSaving && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                    <Switch
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => {
                        setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }));
                        setNotificationSaving(true);
                        // Simulate API call
                        setTimeout(() => {
                          setNotificationSaving(false);
                          toast({ title: 'Settings updated', description: 'Notification preferences saved successfully.' });
                        }, 1000);
                      }}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <MessageSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm">Promotional Emails</div>
                      <div className="text-xs text-muted-foreground">Receive updates about new features and offers</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {notificationSaving && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>}
                    <Switch
                      checked={notificationSettings.promotionalEmails}
                      onCheckedChange={(checked) => {
                        setNotificationSettings(prev => ({ ...prev, promotionalEmails: checked }));
                        setNotificationSaving(true);
                        // Simulate API call
                        setTimeout(() => {
                          setNotificationSaving(false);
                          toast({ title: 'Settings updated', description: 'Notification preferences saved successfully.' });
                        }, 1000);
                      }}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Billing Section */}
          <div className="col-span-1 md:col-span-3 bg-card/80 backdrop-blur border border-green-500/30 shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden mt-2">
            <div className="absolute left-0 top-4 h-8 w-1 bg-gradient-to-b from-green-500 to-green-400 rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-4 sm:mb-5 pl-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              Subscription & Billing
            </h2>
            <div className="space-y-4">
              {/* Current Plan Card */}
              <PlanCard 
                userPlan={user?.plan || 'free'}
                planExpiry={user?.planExpiry}
                userEmail={user?.email}
              />

              {/* Next Billing */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="font-medium text-sm">Next Billing Date</div>
                      <div className="text-xs text-muted-foreground">{subscription.nextBillingDate}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice History */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <div className="font-medium text-sm">Invoice History</div>
                </div>
                <div className="space-y-2">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-medium text-sm">Invoice #{invoice.id}</div>
                          <div className="text-xs text-muted-foreground">{invoice.date}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-sm">{invoice.amount}</div>
                        <div className="text-xs text-muted-foreground capitalize">{invoice.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone Section - full width */}
          <div className="col-span-1 md:col-span-3 bg-card/80 backdrop-blur border border-destructive/60 shadow-xl rounded-2xl p-4 sm:p-6 animate-slide-in-up relative overflow-hidden mt-2">
            <div className="absolute left-0 top-4 h-8 w-1 bg-destructive rounded-r-full" />
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 pl-4 flex items-center gap-2 text-destructive"><Trash2 className="w-4 h-4" /> Danger Zone</h2>
            <div className="flex flex-col gap-3 sm:gap-4">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2 text-xs sm:text-sm h-8"
                disabled={dangerLoading.export}
                onClick={async () => {
                  setDangerLoading(l => ({ ...l, export: true }));
                  try {
                    const res = await fetch(`/api/settings/export?email=${email}`);
                    if (!res.ok) throw new Error('Failed to export data');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'my-data.json';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                    toast({ title: 'Exported', description: 'Your data has been downloaded.' });
                  } catch {
                    toast({ title: 'Error', description: 'Failed to export data', variant: 'destructive' });
                  } finally {
                    setDangerLoading(l => ({ ...l, export: false }));
                  }
                }}
              >
                {dangerLoading.export ? 'Exporting...' : <><Download className="w-3.5 h-3.5" /> Export My Data</>}
              </Button>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 flex items-center gap-2 text-xs sm:text-sm h-8"
                disabled={dangerLoading.reset}
                onClick={async () => {
                  setDangerLoading(l => ({ ...l, reset: true }));
                  try {
                    const res = await fetch('/api/settings/reset-connections', { method: 'POST' });
                    const data = await res.json();
                    if (data.success) {
                      toast({ title: 'Connections reset', description: 'All connections have been reset.' });
                    } else {
                      toast({ title: 'Error', description: data.error || 'Failed to reset connections', variant: 'destructive' });
                    }
                  } catch {
                    toast({ title: 'Error', description: 'Failed to reset connections', variant: 'destructive' });
                  } finally {
                    setDangerLoading(l => ({ ...l, reset: false }));
                  }
                }}
              >
                {dangerLoading.reset ? 'Resetting...' : <><RefreshCcw className="w-3.5 h-3.5" /> Reset All Connections</>}
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-2 text-xs sm:text-sm h-8"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={dangerLoading.delete}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete My Account
              </Button>
              {showDeleteConfirm && (
                <div className="mt-3 p-3 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="mb-2 text-destructive font-semibold text-xs sm:text-sm">Are you sure you want to delete your account? This action cannot be undone.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={dangerLoading.delete} className="text-xs sm:text-sm h-7">Cancel</Button>
                    <Button
                      variant="destructive"
                      disabled={dangerLoading.delete}
                      onClick={async () => {
                        setDangerLoading(l => ({ ...l, delete: true }));
                        try {
                          const res = await fetch('/api/settings/delete-account', {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast({ title: 'Account deleted', description: 'Your account has been deleted.' });
                            await signOut({ redirect: false });
                            router.push('/auth/login');
                          } else {
                            toast({ title: 'Error', description: data.error || 'Failed to delete account', variant: 'destructive' });
                          }
                        } catch {
                          toast({ title: 'Error', description: 'Failed to delete account', variant: 'destructive' });
                        } finally {
                          setDangerLoading(l => ({ ...l, delete: false }));
                        }
                      }}
                      className="text-xs sm:text-sm h-7"
                    >
                      {dangerLoading.delete ? 'Deleting...' : 'Yes, Delete Permanently'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
