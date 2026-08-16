/**
 * Responsive Design Utilities for UNI-TEL Platform
 * 
 * This file contains utilities and patterns for implementing responsive design
 * throughout the UNI-TEL platform to ensure optimal experience on all devices.
 */

/**
 * Breakpoint definitions for consistent responsive design
 */
export const breakpoints = {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px' // 2X large devices (large desktops)
} as const;

/**
 * Responsive design patterns implemented:
 * 
 * 1. Mobile-First Approach:
 *    - Base styles for mobile devices
 *    - Progressive enhancement for larger screens
 *    - Touch-friendly interface elements
 * 
 * 2. Layout Responsiveness:
 *    - Desktop: Fixed sidebar with toggle functionality
 *    - Mobile: Overlay sidebar with burger menu
 *    - Tablet: Hybrid approach with collapsible sidebar
 * 
 * 3. Navigation System:
 *    - Desktop: Always visible sidebar
 *    - Mobile: Hidden sidebar with burger menu toggle
 *    - Tablet: Collapsible sidebar with toggle button
 * 
 * 4. Content Adaptation:
 *    - Responsive padding: p-3 sm:p-4 lg:p-6
 *    - Flexible grid layouts
 *    - Adaptive typography and spacing
 * 
 * 5. Component Responsiveness:
 *    - Cards adapt to screen size
 *    - Tables become scrollable on mobile
 *    - Forms stack vertically on small screens
 *    - Charts and graphs resize appropriately
 * 
 * 6. Performance Considerations:
 *    - Lazy loading for heavy components
 *    - Conditional rendering based on screen size
 *    - Optimized images for different devices
 * 
 * 7. Accessibility:
 *    - Touch targets minimum 44px
 *    - Keyboard navigation support
 *    - Screen reader friendly
 *    - High contrast mode support
 */

/**
 * Common responsive class patterns used throughout the platform:
 * 
 * Layout:
 * - `hidden lg:block` - Hidden on mobile, visible on desktop
 * - `lg:hidden` - Visible on mobile, hidden on desktop
 * - `flex flex-col lg:flex-row` - Stack on mobile, row on desktop
 * 
 * Spacing:
 * - `p-3 sm:p-4 lg:p-6` - Responsive padding
 * - `gap-2 sm:gap-4 lg:gap-6` - Responsive gaps
 * - `space-y-4 lg:space-y-6` - Responsive vertical spacing
 * 
 * Typography:
 * - `text-sm sm:text-base lg:text-lg` - Responsive text sizes
 * - `text-xs sm:text-sm` - Small text responsive
 * 
 * Grid:
 * - `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` - Responsive grid
 * - `col-span-1 lg:col-span-2` - Responsive column spans
 * 
 * Navigation:
 * - `w-80 lg:w-auto` - Full width on mobile, auto on desktop
 * - `fixed lg:relative` - Fixed on mobile, relative on desktop
 * - `z-50 lg:z-auto` - High z-index on mobile, auto on desktop
 */
