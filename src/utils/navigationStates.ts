/**
 * Navigation States and Active Highlighting Guide
 * 
 * This file documents the active state highlighting system implemented
 * in the UNI-TEL sidebar navigation.
 */

/**
 * Active State Highlighting System:
 * 
 * 1. ✅ Active Navigation Items:
 *    - Background: `bg-white/20` (semi-transparent white)
 *    - Text: `text-white` (full white)
 *    - Shadow: `shadow-lg` (elevated appearance)
 *    - Font: `font-medium` (slightly bolder)
 *    - Indicator: White vertical bar on the right
 * 
 * 2. ✅ Inactive Navigation Items:
 *    - Background: Transparent
 *    - Text: `text-white/80` (80% opacity white)
 *    - Hover: `hover:bg-white/10` (subtle hover effect)
 *    - Hover Text: `hover:text-white` (full white on hover)
 *    - Hover Shadow: `hover:shadow-md` (subtle elevation)
 * 
 * 3. ✅ Section Headings (NOT highlighted):
 *    - Always: `text-white` (full white)
 *    - Font: `font-semibold uppercase tracking-wider`
 *    - Icons: `w-3 h-3` (small icons)
 *    - NO active states (headings are not clickable)
 * 
 * 4. ✅ Visual Indicators:
 *    - Active items get a white vertical bar indicator
 *    - Smooth transitions with `transition-all duration-200`
 *    - Rounded corners with `rounded-lg`
 *    - Proper spacing with `mx-2 my-1`
 * 
 * 5. ✅ Responsive Behavior:
 *    - Collapsed state: Icons only, text hidden
 *    - Expanded state: Full text and icons visible
 *    - Active states work in both collapsed and expanded modes
 * 
 * 6. ✅ Navigation Sections:
 *    - Academic: Dashboard, Semesters, Attendance, Marks, Analytics
 *    - Knowledge Hub: Browse Hub, My Uploads, Bookmarks
 *    - Administration: Moderation, Users
 *    - Settings: Settings
 * 
 * 7. ✅ Hover Effects:
 *    - Subtle background change: `hover:bg-white/10`
 *    - Text brightening: `hover:text-white`
 *    - Shadow elevation: `hover:shadow-md`
 *    - Smooth transitions for professional feel
 * 
 * 8. ✅ Accessibility:
 *    - Proper contrast ratios for text visibility
 *    - Clear visual distinction between active/inactive states
 *    - Touch-friendly sizing (40px height)
 *    - Keyboard navigation support
 */

export const navigationStates = {
  active: {
    background: 'bg-white/20',
    text: 'text-white',
    shadow: 'shadow-lg',
    font: 'font-medium',
    indicator: 'absolute right-2 w-1 h-6 bg-white rounded-full'
  },
  inactive: {
    background: 'transparent',
    text: 'text-white/80',
    hover: 'hover:bg-white/10 hover:text-white hover:shadow-md'
  },
  sectionHeadings: {
    text: 'text-white',
    font: 'font-semibold uppercase tracking-wider',
    icon: 'w-3 h-3'
  }
} as const;
