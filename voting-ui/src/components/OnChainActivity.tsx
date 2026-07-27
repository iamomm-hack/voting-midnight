import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../config/tokens';

interface ActivityItem {
  type: string;
  time: string;
  txHash?: string;
  verified: boolean;
}

export const OnChainActivity: React.FC<{ totalVotes: number; isOpen: boolean }> = ({ totalVotes, isOpen }) => {
  const items: ActivityItem[] = [
    ...(totalVotes > 0
      ? [{ type: 'Proof verified — vote included in tally', time: 'Just now', verified: true }]
      : []),
    ...(!isOpen
      ? [{ type: 'Voting period closed', time: '2m ago', verified: true }]
      : []),
    { type: 'Voting period started', time: '1h ago', verified: true },
    { type: 'Proposal created', time: '2h ago', txHash: '0x4f8a…c4b6', verified: true },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: tokens.color.text.tertiary,
          mb: 2,
        }}
      >
        On-chain Activity
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, i) => (
          <Box
            key={`${item.type}-${i}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 1.25,
              borderBottom: i < items.length - 1 ? `1px solid ${tokens.color.border.subtle}` : 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: item.verified ? tokens.color.accent.emerald : tokens.color.text.tertiary,
                  flexShrink: 0,
                }}
              />
              <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.text.secondary }}>
                {item.type}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
              {item.txHash && (
                <Typography sx={{ fontSize: '0.6875rem', fontFamily: tokens.font.mono, color: tokens.color.text.tertiary }}>
                  {item.txHash}
                </Typography>
              )}
              <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>
                {item.time}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
