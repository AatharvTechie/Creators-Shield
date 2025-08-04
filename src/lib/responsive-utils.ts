// Responsive utility functions and constants

export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
  '2xl': 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Responsive class generators
export const responsiveClasses = {
  // Container classes
  container: 'w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16',
  
  // Grid classes
  grid: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
    },
    gap: {
      sm: 'gap-2 sm:gap-3 md:gap-4',
      md: 'gap-4 sm:gap-6 md:gap-8',
      lg: 'gap-6 sm:gap-8 md:gap-10 lg:gap-12',
    }
  },
  
  // Spacing classes
  spacing: {
    section: 'py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24',
    card: 'p-4 sm:p-6 md:p-8 lg:p-10',
    button: 'px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4',
  },
  
  // Typography classes
  text: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    body: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm',
    caption: 'text-xs',
  },
  
  // Icon sizes
  icon: {
    sm: 'h-4 w-4 sm:h-5 sm:w-5',
    md: 'h-5 w-5 sm:h-6 sm:w-6',
    lg: 'h-6 w-6 sm:h-8 sm:w-8',
    xl: 'h-8 w-8 sm:h-10 sm:w-10',
  },
  
  // Avatar sizes
  avatar: {
    sm: 'h-6 w-6 sm:h-8 sm:w-8',
    md: 'h-8 w-8 sm:h-10 sm:w-10',
    lg: 'h-10 w-10 sm:h-12 sm:w-12',
    xl: 'h-12 w-12 sm:h-16 sm:w-16',
  },
  
  // Button sizes
  button: {
    sm: 'h-8 px-3 py-1.5 sm:h-9 sm:px-4 sm:py-2',
    md: 'h-10 px-4 py-2 sm:h-11 sm:px-6 sm:py-3',
    lg: 'h-12 px-6 py-3 sm:h-14 sm:px-8 sm:py-4',
    touch: 'h-12 w-12 sm:h-14 sm:w-14',
  },
  
  // Navigation classes
  nav: {
    mobile: 'lg:hidden',
    desktop: 'hidden lg:block',
    mobileNav: 'fixed inset-0 z-50 bg-background/95 backdrop-blur-sm',
  },
  
  // Sidebar classes
  sidebar: {
    mobile: 'w-80',
    desktop: 'w-64 lg:w-72 xl:w-80',
    collapsed: 'w-16',
  },
  
  // Modal/Dialog classes
  modal: {
    mobile: 'w-[95vw] max-w-sm',
    tablet: 'w-[90vw] max-w-md',
    desktop: 'w-[80vw] max-w-lg',
    large: 'w-[70vw] max-w-xl',
  },
  
  // Form classes
  form: {
    input: 'h-10 px-3 py-2 sm:h-11 sm:px-4 sm:py-3',
    textarea: 'min-h-[80px] px-3 py-2 sm:min-h-[100px] sm:px-4 sm:py-3',
    select: 'h-10 px-3 py-2 sm:h-11 sm:px-4 sm:py-3',
  },
  
  // Table classes
  table: {
    mobile: 'text-xs',
    desktop: 'text-sm',
    header: 'text-xs sm:text-sm font-medium',
    cell: 'text-xs sm:text-sm',
  },
  
  // Card classes
  card: {
    mobile: 'p-4',
    tablet: 'p-6',
    desktop: 'p-8',
    large: 'p-10',
  },
  
  // List classes
  list: {
    mobile: 'space-y-2',
    desktop: 'space-y-3',
    large: 'space-y-4',
  },
};

// Responsive visibility classes
export const visibilityClasses = {
  // Show/hide based on screen size
  show: {
    xs: 'block xs:hidden',
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
    '2xl': 'hidden 2xl:block',
  },
  hide: {
    xs: 'hidden xs:block',
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
    '2xl': 'block 2xl:hidden',
  },
  
  // Flex visibility
  flex: {
    xs: 'flex xs:hidden',
    sm: 'hidden sm:flex',
    md: 'hidden md:flex',
    lg: 'hidden lg:flex',
    xl: 'hidden xl:flex',
    '2xl': 'hidden 2xl:flex',
  },
  
  // Grid visibility
  grid: {
    xs: 'grid xs:hidden',
    sm: 'hidden sm:grid',
    md: 'hidden md:grid',
    lg: 'hidden lg:grid',
    xl: 'hidden xl:grid',
    '2xl': 'hidden 2xl:grid',
  },
};

// Responsive layout helpers
export const layoutHelpers = {
  // Container max widths
  maxWidth: {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  },
  
  // Aspect ratios
  aspect: {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    portrait: 'aspect-[3/4]',
  },
  
  // Object fit
  objectFit: {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    scaleDown: 'object-scale-down',
  },
  
  // Position
  position: {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
  },
  
  // Z-index
  zIndex: {
    0: 'z-0',
    10: 'z-10',
    20: 'z-20',
    30: 'z-30',
    40: 'z-40',
    50: 'z-50',
    auto: 'z-auto',
  },
};

// Touch-friendly utilities
export const touchHelpers = {
  // Minimum touch target size
  minTouchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Touch-friendly spacing
  touchSpacing: 'p-3 sm:p-4',
  
  // Touch-friendly button
  touchButton: 'h-12 w-12 sm:h-14 sm:w-14',
  
  // Touch-friendly input
  touchInput: 'h-12 px-4 py-3 sm:h-14 sm:px-6 sm:py-4',
  
  // Touch-friendly link
  touchLink: 'p-3 sm:p-4',
};

// Animation utilities
export const animationHelpers = {
  // Transition durations
  duration: {
    fast: 'duration-150',
    normal: 'duration-300',
    slow: 'duration-500',
    slower: 'duration-700',
  },
  
  // Transition timing functions
  easing: {
    linear: 'ease-linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
  
  // Transform utilities
  transform: {
    scale: {
      hover: 'hover:scale-105',
      active: 'active:scale-95',
      focus: 'focus:scale-105',
    },
    translate: {
      up: 'hover:-translate-y-1',
      down: 'hover:translate-y-1',
      left: 'hover:-translate-x-1',
      right: 'hover:translate-x-1',
    },
  },
};

// Media query helpers
export const mediaQueries = {
  // Check if screen size matches
  isMobile: () => typeof window !== 'undefined' && window.innerWidth < BREAKPOINTS.md,
  isTablet: () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg,
  isDesktop: () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.lg,
  isLargeScreen: () => typeof window !== 'undefined' && window.innerWidth >= BREAKPOINTS.xl,
  
  // Get current breakpoint
  getCurrentBreakpoint: (): Breakpoint => {
    if (typeof window === 'undefined') return 'xs';
    
    const width = window.innerWidth;
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  },
  
  // Check if device is touch-enabled
  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Check device orientation
  getOrientation: () => {
    if (typeof window === 'undefined') return 'portrait';
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  },
};

// Utility functions
export const responsiveUtils = {
  // Combine responsive classes
  combine: (...classes: string[]) => classes.filter(Boolean).join(' '),
  
  // Create responsive class based on breakpoint
  responsive: (base: string, breakpoints: Partial<Record<Breakpoint, string>>) => {
    const classes = [base];
    Object.entries(breakpoints).forEach(([breakpoint, className]) => {
      if (className) {
        classes.push(`${breakpoint}:${className}`);
      }
    });
    return classes.join(' ');
  },
  
  // Create responsive spacing
  spacing: (base: string, responsive: Partial<Record<Breakpoint, string>>) => {
    return responsiveUtils.responsive(base, responsive);
  },
  
  // Create responsive typography
  typography: (base: string, responsive: Partial<Record<Breakpoint, string>>) => {
    return responsiveUtils.responsive(base, responsive);
  },
  
  // Create responsive layout
  layout: (base: string, responsive: Partial<Record<Breakpoint, string>>) => {
    return responsiveUtils.responsive(base, responsive);
  },
};

// Export all utilities
export default {
  BREAKPOINTS,
  responsiveClasses,
  visibilityClasses,
  layoutHelpers,
  touchHelpers,
  animationHelpers,
  mediaQueries,
  responsiveUtils,
}; 