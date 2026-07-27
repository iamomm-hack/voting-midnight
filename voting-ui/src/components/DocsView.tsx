import React from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { tokens } from '../config/tokens';

export const DocsView: React.FC = () => {
  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Chip
          label="Institutional Documentation"
          size="small"
          sx={{
            background: tokens.color.accent.violetSubtle,
            color: tokens.color.accent.violet,
            border: `1px solid ${tokens.color.border.active}`,
            fontWeight: 600,
            fontSize: '0.75rem',
            mb: 1.5,
          }}
        />
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 800, color: tokens.color.text.primary, mb: 1 }}>
          Midnight ZK Governance Specs
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', color: tokens.color.text.tertiary, maxWidth: 640, mx: 'auto' }}>
          Technical specification and zero-knowledge privacy architecture governing anonymous on-chain voting on the Midnight Network.
        </Typography>
      </Box>

      {/* Grid of Docs Sections */}
      <Grid container spacing={3}>
        {/* Section 1: ZK Privacy Guarantees */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: tokens.radius.xl,
              background: tokens.color.bg.surface,
              border: `1px solid ${tokens.color.border.subtle}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.radius.md,
                  background: tokens.color.accent.violetSubtle,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SecurityIcon sx={{ fontSize: 20, color: tokens.color.accent.violet }} />
              </Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: tokens.color.text.primary }}>
                Zero-Knowledge Privacy Model
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.text.secondary, lineHeight: 1.6, mb: 2 }}>
              The Midnight Privacy Voting DApp leverages Compact zero-knowledge circuits. Voter secret keys and raw identity inputs remain strictly inside local browser witness memory.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <DocBullet label="Public State" value="Proposal Title, Total YES/NO counts, Voting State, Sequence counter" />
              <DocBullet label="Private State" value="Voter secret key (localSecretKey), unshielded wallet credentials" />
              <DocBullet label="Nullifier Protection" value="Disclosed voter public key derived via persistentHash to prevent double-voting" />
            </Box>
          </Paper>
        </Grid>

        {/* Section 2: Compact Circuit Specification */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              borderRadius: tokens.radius.xl,
              background: tokens.color.bg.surface,
              border: `1px solid ${tokens.color.border.subtle}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.radius.md,
                  background: 'rgba(52, 211, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CodeIcon sx={{ fontSize: 20, color: tokens.color.accent.emerald }} />
              </Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: tokens.color.text.primary }}>
                Compact Circuit (`voting.compact`)
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                borderRadius: tokens.radius.md,
                background: '#090a0f',
                border: `1px solid ${tokens.color.border.subtle}`,
                fontFamily: tokens.font.mono,
                fontSize: '0.75rem',
                color: tokens.color.text.secondary,
                mb: 2,
              }}
            >
              <span style={{ color: '#8b5cf6' }}>export circuit</span> castVote(voteChoice: Boolean): [] {'{\n'}
              {'  '}assert(state == VotingState.VOTING_OPEN);{'\n'}
              {'  '}const voterPk = disclose(voterPublicKey(localSecretKey()));{'\n'}
              {'  '}if (disclose(voteChoice)) yesVotes.increment(1);{'\n'}
              {'}'}
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.text.secondary, lineHeight: 1.6 }}>
              Compiled via Compact v0.31.0 compiler into local ZKIR assets (`voting.zkir`) and proving keys used during browser execution.
            </Typography>
          </Paper>
        </Grid>

        {/* Section 3: Verified Preprod Infrastructure */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: tokens.radius.xl,
              background: tokens.color.bg.surface,
              border: `1px solid ${tokens.color.border.subtle}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.radius.md,
                  background: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StorageIcon sx={{ fontSize: 20, color: '#38bdf8' }} />
              </Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: tokens.color.text.primary }}>
                Testnet Infrastructure
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <DocInfoRow label="Network" value="Midnight Preprod Testnet" />
              <DocInfoRow label="Verified Contract" value="0x02004f8a...891ab0" mono />
              <DocInfoRow label="RPC Node" value="https://rpc.preprod.midnight.network" mono />
              <DocInfoRow label="Indexer GraphQL" value="https://indexer.preprod.midnight.network" mono />
              <DocInfoRow label="Local Proof Server" value="http://localhost:6300 (Docker)" mono />
            </Box>
          </Paper>
        </Grid>

        {/* Section 4: Native Wallet Integration Guide */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: tokens.radius.xl,
              background: tokens.color.bg.surface,
              border: `1px solid ${tokens.color.border.subtle}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.radius.md,
                  background: 'rgba(251, 146, 60, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#fb923c' }} />
              </Box>
              <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: tokens.color.text.primary }}>
                Wallet Integration Flow
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.text.secondary, lineHeight: 1.6, mb: 2 }}>
              Connect using native Lace Wallet or 1AM Wallet extensions via <code style={{ color: tokens.color.accent.violet }}>window.midnight</code> API.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <DocStep number="1" title="Connect Wallet" desc="Select Lace Wallet or 1AM Wallet from the top right nav." />
              <DocStep number="2" title="Cast Vote" desc="Select FOR or AGAINST and click Confirm Vote." />
              <DocStep number="3" title="Approve Transaction" desc="Confirm in the approval modal to sign local ZK proof." />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

const DocBullet: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
    <VerifiedUserIcon sx={{ fontSize: 14, color: tokens.color.accent.violet, mt: 0.25, flexShrink: 0 }} />
    <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.secondary }}>
      <strong style={{ color: tokens.color.text.primary }}>{label}:</strong> {value}
    </Typography>
  </Box>
);

const DocInfoRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: '0.75rem',
        fontWeight: 600,
        color: tokens.color.text.primary,
        fontFamily: mono ? tokens.font.mono : 'inherit',
      }}
    >
      {value}
    </Typography>
  </Box>
);

const DocStep: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: tokens.color.accent.violetSubtle,
        border: `1px solid ${tokens.color.border.active}`,
        color: tokens.color.accent.violet,
        fontSize: '0.6875rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        mt: 0.25,
      }}
    >
      {number}
    </Box>
    <Box>
      <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: tokens.color.text.primary }}>{title}</Typography>
      <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>{desc}</Typography>
    </Box>
  </Box>
);
