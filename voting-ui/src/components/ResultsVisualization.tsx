import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../config/tokens';

interface ResultsVisualizationProps {
  yesVotes: number;
  noVotes: number;
  isOpen: boolean;
}

export const ResultsVisualization: React.FC<ResultsVisualizationProps> = ({ yesVotes, noVotes, isOpen }) => {
  const total = yesVotes + noVotes;
  const yesPct = total > 0 ? (yesVotes / total) * 100 : 50;
  const noPct = total > 0 ? (noVotes / total) * 100 : 50;
  const quorumTarget = 200;
  const quorumPct = Math.min((total / quorumTarget) * 100, 100);

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: tokens.radius.lg,
        background: tokens.color.bg.surface,
        border: `1px solid ${tokens.color.border.subtle}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: tokens.color.text.tertiary }}>
          Current Results
        </Typography>
        <Typography sx={{ fontSize: '0.6875rem', fontFamily: tokens.font.mono, color: tokens.color.text.tertiary }}>
          {total} verified
        </Typography>
      </Box>

      {/* Bar */}
      <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2, background: 'rgba(255,255,255,0.04)' }}>
        <Box
          sx={{
            width: `${yesPct}%`,
            background: tokens.color.accent.emerald,
            borderRadius: yesPct === 100 ? '4px' : '4px 0 0 4px',
            transition: `width ${tokens.transition.slow}`,
          }}
        />
        <Box
          sx={{
            width: `${noPct}%`,
            background: tokens.color.accent.red,
            borderRadius: noPct === 100 ? '4px' : '0 4px 4px 0',
            transition: `width ${tokens.transition.slow}`,
          }}
        />
      </Box>

      {/* Labels */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: 2, background: tokens.color.accent.emerald }} />
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: tokens.color.accent.emerald }}>
            For
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}>
            {yesVotes} ({yesPct.toFixed(1)}%)
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.8125rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}>
            {noVotes} ({noPct.toFixed(1)}%)
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: tokens.color.accent.red }}>
            Against
          </Typography>
          <Box sx={{ width: 8, height: 8, borderRadius: 2, background: tokens.color.accent.red }} />
        </Box>
      </Box>

      {/* Quorum */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>Quorum</Typography>
          <Typography sx={{ fontSize: '0.6875rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}>
            {total}/{quorumTarget} ({quorumPct.toFixed(0)}%)
          </Typography>
        </Box>
        <Box sx={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${quorumPct}%`,
              borderRadius: 2,
              background: quorumPct >= 100 ? tokens.color.accent.emerald : tokens.color.accent.violet,
              transition: `width ${tokens.transition.slow}`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
