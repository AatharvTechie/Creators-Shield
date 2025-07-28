'use client';

import React, { useState, useEffect } from 'react';
import { SuspensionDialog } from './suspension-dialog';
import { useSuspensionCheck } from '@/hooks/use-suspension-check';
import { useRouter } from 'next/navigation';

export function SuspensionOverlay() {
  const { suspensionStatus, loading } = useSuspensionCheck();
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (suspensionStatus?.isSuspended && !showDialog) {
      setShowDialog(true);
    }
  }, [suspensionStatus, showDialog]);

  const handleDialogClose = () => {
    setShowDialog(false);
    // Redirect to login page after dialog closes
    router.push('/auth/login');
  };

  if (loading || !suspensionStatus?.isSuspended) {
    return null;
  }

  return (
    <SuspensionDialog
      isOpen={showDialog}
      onClose={handleDialogClose}
      timeRemaining={suspensionStatus.timeRemaining || 0}
      hours={suspensionStatus.hours}
      minutes={suspensionStatus.minutes}
      seconds={suspensionStatus.seconds}
    />
  );
} 