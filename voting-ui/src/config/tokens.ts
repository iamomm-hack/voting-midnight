/** Design tokens for the Midnight governance interface */
export const tokens = {
  color: {
    bg: {
      base: '#0c0d12',
      elevated: '#13141b',
      surface: '#1a1b24',
      surfaceHover: '#21222d',
      overlay: 'rgba(12, 13, 18, 0.92)',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.06)',
      default: 'rgba(255, 255, 255, 0.1)',
      active: 'rgba(139, 92, 246, 0.5)',
      success: 'rgba(52, 211, 153, 0.4)',
      error: 'rgba(239, 68, 68, 0.3)',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#8b95a9',
      tertiary: '#5a6478',
      inverse: '#0c0d12',
    },
    accent: {
      violet: '#8b5cf6',
      violetMuted: 'rgba(139, 92, 246, 0.15)',
      violetSubtle: 'rgba(139, 92, 246, 0.08)',
      emerald: '#34d399',
      emeraldMuted: 'rgba(52, 211, 153, 0.15)',
      red: '#f87171',
      redMuted: 'rgba(248, 113, 113, 0.12)',
    },
    status: {
      online: '#34d399',
      offline: '#f87171',
      pending: '#fbbf24',
    },
  },
  font: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", "Fira Code", "Cascadia Code", monospace',
  },
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
    glow: {
      violet: '0 0 20px rgba(139, 92, 246, 0.15)',
      emerald: '0 0 20px rgba(52, 211, 153, 0.1)',
    },
  },
  spacing: {
    page: { xs: '16px', sm: '24px', md: '32px', lg: '48px', xl: '64px' },
  },
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;
