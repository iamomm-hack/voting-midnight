import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../config/tokens';

export const PrivacyGuarantee: React.FC = () => {
  const guarantees = [
    { label: 'Vote choice', status: 'Encrypted' },
    { label: 'Voter identity', status: 'Not disclosed' },
    { label: 'Proof generation', status: 'Local device' },
    { label: 'Aggregate tally', status: 'Publicly verifiable' },
  ];

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: tokens.radius.lg,
        background: tokens.color.bg.surface,
        border: `1px solid ${tokens.color.border.subtle}`,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: tokens.color.text.tertiary,
          mb: 1.5,
        }}
      >
        Privacy Guarantee
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {guarantees.map((g) => (
          <Box key={g.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.text.secondary }}>{g.label}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: tokens.color.accent.emerald }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: tokens.color.accent.emerald }}>
                {g.status}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
