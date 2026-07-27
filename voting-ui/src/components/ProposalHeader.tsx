import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { tokens } from '../config/tokens';

interface ProposalHeaderProps {
  title: string;
  isOpen: boolean;
  contractAddress: string;
}

export const ProposalHeader: React.FC<ProposalHeaderProps> = ({ title, isOpen, contractAddress }) => {
  const [copied, setCopied] = React.useState(false);
  const shortAddr = contractAddress.length > 16
    ? `${contractAddress.slice(0, 8)}…${contractAddress.slice(-6)}`
    : contractAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Meta row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: tokens.color.text.tertiary,
          }}
        >
          Proposal #01
        </Typography>

        <Box sx={{ width: 4, height: 4, borderRadius: '50%', background: tokens.color.text.tertiary }} />

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            px: 1,
            py: 0.25,
            borderRadius: '100px',
            background: isOpen ? tokens.color.accent.emeraldMuted : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isOpen ? tokens.color.border.success : tokens.color.border.subtle}`,
          }}
        >
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isOpen ? tokens.color.accent.emerald : tokens.color.text.tertiary,
              ...(isOpen && {
                boxShadow: `0 0 6px ${tokens.color.accent.emerald}`,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': { '0%, 100%': { opacity: 1 }, '50%': { opacity: 0.5 } },
              }),
            }}
          />
          <Typography sx={{ fontSize: '0.625rem', fontWeight: 600, color: isOpen ? tokens.color.accent.emerald : tokens.color.text.tertiary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {isOpen ? 'Active' : 'Closed'}
          </Typography>
        </Box>
      </Box>

      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 700,
          color: tokens.color.text.primary,
          lineHeight: 1.3,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      {/* Contract address row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>Contract</Typography>
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontFamily: tokens.font.mono,
            color: tokens.color.text.secondary,
            background: 'rgba(255,255,255,0.04)',
            px: 1,
            py: 0.25,
            borderRadius: tokens.radius.sm,
            border: `1px solid ${tokens.color.border.subtle}`,
          }}
        >
          {shortAddr}
        </Typography>
        <Tooltip title={copied ? 'Copied' : 'Copy'}>
          <IconButton size="small" onClick={handleCopy} sx={{ p: 0.25, color: tokens.color.text.tertiary }}>
            <ContentCopyIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="View on explorer">
          <IconButton
            size="small"
            component="a"
            href={`https://explorer.preprod.midnight.network/`}
            target="_blank"
            rel="noopener"
            sx={{ p: 0.25, color: tokens.color.text.tertiary }}
          >
            <OpenInNewIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
