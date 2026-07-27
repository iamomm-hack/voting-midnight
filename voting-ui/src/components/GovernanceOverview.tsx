import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../config/tokens';

const Stat: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <Box sx={{ textAlign: 'right' }}>
    <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary, mb: 0.25 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: color || tokens.color.text.primary, fontFamily: tokens.font.mono }}>
      {value}
    </Typography>
  </Box>
);

export const GovernanceOverview: React.FC<{ totalVotes: number; isOpen: boolean }> = ({ totalVotes, isOpen }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'flex-end' },
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 3, md: 0 },
      py: { xs: 3, md: 4 },
      px: { xs: 2, md: 0 },
      borderBottom: `1px solid ${tokens.color.border.subtle}`,
    }}
  >
    {/* Left: Heading */}
    <Box sx={{ maxWidth: 520 }}>
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: tokens.color.accent.violet,
          mb: 1,
        }}
      >
        Private Governance
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontSize: { xs: '1.75rem', md: '2.25rem' },
          fontWeight: 700,
          color: tokens.color.text.primary,
          mb: 1,
          lineHeight: 1.15,
        }}
      >
        Vote privately. Verify publicly.
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: tokens.color.text.secondary, lineHeight: 1.6, maxWidth: 460 }}>
        Individual choices remain hidden through zero-knowledge proofs. Aggregate results are verifiable on-chain by anyone.
      </Typography>
    </Box>

    {/* Right: Protocol stats */}
    <Box
      sx={{
        display: 'flex',
        gap: { xs: 3, md: 4 },
        alignItems: 'flex-end',
        flexShrink: 0,
      }}
    >
      <Stat label="ZK Circuit" value="Active" color={tokens.color.accent.emerald} />
      <Box sx={{ width: '1px', height: 32, background: tokens.color.border.subtle }} />
      <Stat label="Network" value="Preprod" />
      <Box sx={{ width: '1px', height: 32, background: tokens.color.border.subtle }} />
      <Stat label="Proposals" value="1" />
      <Box sx={{ width: '1px', height: 32, background: tokens.color.border.subtle, display: { xs: 'none', sm: 'block' } }} />
      <Stat label="Verified Votes" value={String(totalVotes)} color={isOpen ? tokens.color.text.primary : tokens.color.text.tertiary} />
    </Box>
  </Box>
);
