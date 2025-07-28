
'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { useRouter } from 'next/navigation';

const mockAdminUser = {
  displayName: "Admin User",
  avatar: "https://placehold.co/128x128.png",
};

const ADMIN_EMAILS = [
  'guddumisra003@gmail.com',
  'contactpradeeprajput@gmail.com',
];

import { AdminProfileProvider } from './profile-context';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showPopup, setShowPopup] = React.useState(false);

  // Optionally, you can keep the popup logic if you want to show a message for non-admins
  // But do NOT check localStorage or tokens here. Middleware will handle protection.

  return (
    <AdminProfileProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          <DashboardHeader title="Admin Dashboard" admin={true} />
          <main className="p-4 md:p-6">
            {showPopup && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                  <h2 className="text-xl font-bold mb-2">Access Denied</h2>
                  <p className="mb-4">You do not have access to become an admin.<br/>We are redirecting you to the creator dashboard in 3 seconds.</p>
                </div>
              </div>
            )}
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AdminProfileProvider>
  );
}
