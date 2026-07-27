import React from 'react';
import { Box, Typography, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { tokens } from '../../config/tokens';

const NavLink: React.FC<{ label: string; active?: boolean }> = ({ label, active }) => (
  <Typography
    component="a"
    href="#"
    onClick={(e: React.MouseEvent) => e.preventDefault()}
    sx={{
      fontSize: '0.8125rem',
      fontWeight: 500,
      color: active ? tokens.color.text.primary : tokens.color.text.tertiary,
      textDecoration: 'none',
      px: 1.5,
      py: 0.75,
      borderRadius: tokens.radius.sm,
      transition: tokens.transition.fast,
      '&:hover': { color: tokens.color.text.primary, background: 'rgba(255,255,255,0.04)' },
    }}
  >
    {label}
  </Typography>
);

const NetworkDot: React.FC = () => (
  <Box
    sx={{
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: tokens.color.status.online,
      boxShadow: `0 0 6px ${tokens.color.status.online}`,
      animation: 'pulse 2s ease-in-out infinite',
      '@keyframes pulse': {
        '0%, 100%': { opacity: 1 },
        '50%': { opacity: 0.5 },
      },
    }}
  />
);

export const TopNavigation: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const walletAddr = '0x02004f8a…891ab0';

  const handleCopy = () => {
    navigator.clipboard.writeText('0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0');
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box
      component="nav"
      role="navigation"
      aria-label="Main navigation"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        px: { xs: 2, md: 4 },
        borderBottom: `1px solid ${tokens.color.border.subtle}`,
        background: 'rgba(12, 13, 18, 0.8)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Logo + Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: tokens.radius.sm,
              background: `linear-gradient(135deg, ${tokens.color.accent.violet}, ${tokens.color.accent.emerald})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '11px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>M</Typography>
          </Box>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: tokens.color.text.primary, letterSpacing: '-0.01em' }}>
            Midnight
          </Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          <NavLink label="Proposals" active />
          <NavLink label="Activity" />
          <NavLink label="Docs" />
        </Box>
      </Box>

      {/* Right: Network + Wallet */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.5,
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.border.subtle}`,
            background: tokens.color.bg.elevated,
          }}
        >
          <NetworkDot />
          <Typography sx={{ fontSize: '0.6875rem', fontWeight: 500, color: tokens.color.text.secondary }}>
            Preprod
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.border.subtle}`,
            background: tokens.color.bg.elevated,
            cursor: 'pointer',
            transition: tokens.transition.fast,
            '&:hover': { borderColor: tokens.color.border.active },
          }}
        >
          <Typography sx={{ fontSize: '0.6875rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}>
            {walletAddr}
          </Typography>
          <Tooltip title={copied ? 'Copied' : 'Copy address'}>
            <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25, color: tokens.color.text.tertiary }}>
              <ContentCopyIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};
