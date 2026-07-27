import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Popover } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { tokens } from '../config/tokens';

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

interface WalletOption {
  name: string;
  description: string;
}

const wallets: WalletOption[] = [
  { name: 'Lace Wallet', description: 'Midnight-compatible browser extension' },
  { name: '1AM Wallet', description: 'Privacy-first mobile wallet' },
];

export const TopNavigation: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleConnect = (walletName: string) => {
    setConnectedWallet(walletName);
    handleClose();
  };

  const handleDisconnect = () => {
    setConnectedWallet(null);
    handleClose();
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

        {/* Connect Wallet Button */}
        <Button
          ref={buttonRef}
          onClick={handleOpen}
          startIcon={<AccountBalanceWalletIcon sx={{ fontSize: '16px !important' }} />}
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            px: 2,
            py: 0.75,
            borderRadius: tokens.radius.md,
            textTransform: 'none',
            ...(connectedWallet
              ? {
                  background: tokens.color.accent.emeraldMuted,
                  border: `1px solid ${tokens.color.border.success}`,
                  color: tokens.color.accent.emerald,
                  '&:hover': { background: 'rgba(52, 211, 153, 0.2)' },
                }
              : {
                  background: `linear-gradient(135deg, ${tokens.color.accent.violet}, #6d28d9)`,
                  color: '#fff',
                  border: 'none',
                  boxShadow: tokens.shadow.glow.violet,
                  '&:hover': { background: `linear-gradient(135deg, #7c3aed, #5b21b6)` },
                }),
          }}
        >
          {connectedWallet || 'Connect Wallet'}
        </Button>

        {/* Wallet Popover */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                background: tokens.color.bg.elevated,
                border: `1px solid ${tokens.color.border.subtle}`,
                borderRadius: tokens.radius.lg,
                boxShadow: tokens.shadow.lg,
                minWidth: 260,
                overflow: 'hidden',
              },
            },
          }}
        >
          <Box sx={{ p: 1 }}>
            <Typography sx={{ px: 1.5, py: 1, fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.color.text.tertiary }}>
              {connectedWallet ? 'Connected' : 'Select Wallet'}
            </Typography>

            {connectedWallet ? (
              <>
                <Box sx={{ px: 1.5, py: 1, mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: tokens.color.text.primary }}>{connectedWallet}</Typography>
                  <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary, mt: 0.25 }}>Preprod Testnet</Typography>
                </Box>
                <Box
                  component="button"
                  onClick={handleDisconnect}
                  sx={{
                    all: 'unset',
                    display: 'block',
                    width: '100%',
                    px: 1.5,
                    py: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: tokens.color.accent.red,
                    cursor: 'pointer',
                    borderRadius: tokens.radius.sm,
                    transition: tokens.transition.fast,
                    boxSizing: 'border-box',
                    '&:hover': { background: tokens.color.accent.redMuted },
                  }}
                >
                  Disconnect
                </Box>
              </>
            ) : (
              wallets.map((w) => (
                <Box
                  key={w.name}
                  component="button"
                  onClick={() => handleConnect(w.name)}
                  sx={{
                    all: 'unset',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    width: '100%',
                    px: 1.5,
                    py: 1.25,
                    cursor: 'pointer',
                    borderRadius: tokens.radius.md,
                    transition: tokens.transition.fast,
                    boxSizing: 'border-box',
                    '&:hover': { background: 'rgba(255,255,255,0.04)' },
                    '&:focus-visible': { outline: `2px solid ${tokens.color.accent.violet}`, outlineOffset: '-2px' },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: tokens.radius.sm,
                      background: w.name === 'Lace Wallet'
                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                        : 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>
                      {w.name === 'Lace Wallet' ? 'L' : '1A'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: tokens.color.text.primary }}>{w.name}</Typography>
                    <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>{w.description}</Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
};
