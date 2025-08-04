
'use client';

import * as React from "react"

// Responsive breakpoints
const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    
    // Set the initial value on the client after mount
    setIsMobile(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    // Add listener
    mql.addEventListener("change", onChange);
    
    // Clean up listener
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}

export function useBreakpoint(breakpoint: Breakpoint) {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]}px)`)
    
    // Set the initial value on the client after mount
    setIsAboveBreakpoint(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsAboveBreakpoint(e.matches);
    };

    // Add listener
    mql.addEventListener("change", onChange);
    
    // Clean up listener
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isAboveBreakpoint;
}

export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint;
  }>({
    width: 0,
    height: 0,
    breakpoint: 'xs'
  });

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint = 'xs';
      if (width >= BREAKPOINTS['2xl']) breakpoint = '2xl';
      else if (width >= BREAKPOINTS.xl) breakpoint = 'xl';
      else if (width >= BREAKPOINTS.lg) breakpoint = 'lg';
      else if (width >= BREAKPOINTS.md) breakpoint = 'md';
      else if (width >= BREAKPOINTS.sm) breakpoint = 'sm';
      
      setScreenSize({ width, height, breakpoint });
    };

    // Set initial size
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
    
    setIsTablet(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsTablet(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isTablet;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.lg}px)`)
    
    setIsDesktop(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
}

export function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${BREAKPOINTS.xl}px)`)
    
    setIsLargeScreen(mql.matches);

    const onChange = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches);
    };

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isLargeScreen;
}

// Touch device detection
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState(false);

  React.useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouchScreen);
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
}

// Orientation detection
export function useOrientation() {
  const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

  React.useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);
    
    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}
