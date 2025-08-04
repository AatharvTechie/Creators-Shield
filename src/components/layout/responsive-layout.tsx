'use client';

import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export function ResponsiveLayout({ children, sidebar, className }: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  return (
    <SidebarProvider defaultOpen={isDesktop}>
      <div className={`min-h-screen flex overflow-hidden ${className || ''}`}>
        {/* Sidebar - Hidden on mobile, shown on desktop */}
        {sidebar && (
          <div className="hidden lg:block">
            {sidebar}
          </div>
        )}
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

// Responsive container component
export function ResponsiveContainer({ 
  children, 
  className = '',
  maxWidth = 'max-w-7xl'
}: { 
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  return (
    <div className={`w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 ${maxWidth} ${className}`}>
      {children}
    </div>
  );
}

// Responsive grid component
export function ResponsiveGrid({ 
  children, 
  className = '',
  cols = { xs: 1, sm: 2, md: 3, lg: 4 }
}: { 
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const gridCols = [
    cols.xs ? `grid-cols-${cols.xs}` : 'grid-cols-1',
    cols.sm ? `sm:grid-cols-${cols.sm}` : '',
    cols.md ? `md:grid-cols-${cols.md}` : '',
    cols.lg ? `lg:grid-cols-${cols.lg}` : '',
    cols.xl ? `xl:grid-cols-${cols.xl}` : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 ${gridCols} ${className}`}>
      {children}
    </div>
  );
}

// Responsive section component
export function ResponsiveSection({ 
  children, 
  className = '',
  padding = 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24'
}: { 
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <section className={`${padding} ${className}`}>
      {children}
    </section>
  );
}

// Responsive card wrapper
export function ResponsiveCard({ 
  children, 
  className = '',
  padding = 'p-4 sm:p-6 md:p-8 lg:p-10'
}: { 
  children: React.ReactNode;
  className?: string;
  padding?: string;
}) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md ${padding} ${className}`}>
      {children}
    </div>
  );
}

// Responsive text component
export function ResponsiveText({ 
  children, 
  variant = 'body',
  className = ''
}: { 
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption';
  className?: string;
}) {
  const textClasses = {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm',
    caption: 'text-xs'
  };

  return (
    <div className={`${textClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

// Responsive button wrapper
export function ResponsiveButton({ 
  children, 
  variant = 'default',
  size = 'default',
  className = '',
  ...props
}: { 
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'touch-sm' | 'touch-lg';
  className?: string;
  [key: string]: any;
}) {
  return (
    <button 
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 touch-target ${className}`}
      {...props}
    >
      {children}
    </button>
  );
} 