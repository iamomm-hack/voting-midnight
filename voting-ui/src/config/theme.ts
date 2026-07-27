import { createTheme } from '@mui/material';
import { tokens } from './tokens';

export const theme = createTheme({
  typography: {
    fontFamily: tokens.font.sans,
    allVariants: { color: tokens.color.text.primary },
    h3: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h4: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 },
    h5: { fontWeight: 600, letterSpacing: '-0.015em' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 500, color: tokens.color.text.secondary },
    subtitle2: { fontWeight: 500, fontSize: '0.8125rem', color: tokens.color.text.secondary },
    body1: { lineHeight: 1.65, color: tokens.color.text.secondary },
    body2: { lineHeight: 1.6, color: tokens.color.text.secondary, fontSize: '0.875rem' },
    caption: { color: tokens.color.text.tertiary, fontSize: '0.75rem', lineHeight: 1.5 },
    button: { textTransform: 'none' as const, fontWeight: 600 },
  },
  palette: {
    mode: 'dark',
    primary: { main: tokens.color.accent.violet },
    secondary: { main: tokens.color.accent.emerald },
    error: { main: tokens.color.accent.red },
    background: { default: tokens.color.bg.base, paper: tokens.color.bg.elevated },
    text: { primary: tokens.color.text.primary, secondary: tokens.color.text.secondary },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': { boxSizing: 'border-box' },
        'html, body': {
          margin: 0,
          padding: 0,
          backgroundColor: tokens.color.bg.base,
          color: tokens.color.text.primary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::-webkit-scrollbar': { width: '6px' },
        '::-webkit-scrollbar-track': { background: 'transparent' },
        '::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.08)', borderRadius: '3px' },
        '@media (prefers-reduced-motion: reduce)': {
          '*': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          textTransform: 'none' as const,
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 16px',
          minHeight: '36px',
          transition: tokens.transition.fast,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.color.bg.surface,
          border: `1px solid ${tokens.color.border.subtle}`,
          color: tokens.color.text.primary,
          fontSize: '0.75rem',
          borderRadius: tokens.radius.sm,
          padding: '6px 10px',
        },
      },
    },
  },
});
