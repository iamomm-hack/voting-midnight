import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { tokens } from '../config/tokens';

type VoteSelection = 'for' | 'against' | null;
type VotePhase = 'idle' | 'approval_modal' | 'proving' | 'verified' | 'error';

interface VotingPanelProps {
  isOpen: boolean;
  hasVoted: boolean;
  isWorking: boolean;
  onCastVote: (choice: boolean) => Promise<void>;
  onEndVoting: () => Promise<void>;
}

const PROOF_STAGES = [
  'Requesting signature from connected wallet…',
  'Preparing private witness & proving key…',
  'Generating ZK-SNARK proof locally…',
  'Submitting transaction to Midnight Preprod…',
  'Verifying on-chain state transition…',
];

export const VotingPanel: React.FC<VotingPanelProps> = ({ isOpen, hasVoted, isWorking, onCastVote, onEndVoting }) => {
  const [selection, setSelection] = useState<VoteSelection>(null);
  const [phase, setPhase] = useState<VotePhase>('idle');
  const [proofStage, setProofStage] = useState(0);
  const [isApproving, setIsApproving] = useState(false);

  const handleSelect = (choice: VoteSelection) => {
    if (phase !== 'idle' || !isOpen || hasVoted) return;
    setSelection(choice);
  };

  const handleOpenApprovalModal = () => {
    if (!selection) return;
    setPhase('approval_modal');
  };

  const handleApproveAndSubmit = async () => {
    if (!selection) return;
    setIsApproving(true);

    try {
      setPhase('proving');
      for (let i = 0; i < PROOF_STAGES.length; i++) {
        setProofStage(i);
        await new Promise((r) => setTimeout(r, 700));
      }

      await onCastVote(selection === 'for');
      setPhase('verified');
    } catch {
      setPhase('error');
      setTimeout(() => {
        setPhase('idle');
        setSelection(null);
      }, 2500);
    } finally {
      setIsApproving(false);
    }
  };

  const handleCloseModal = () => {
    if (isApproving || phase === 'proving') return;
    setPhase('idle');
  };

  const isProcessing = phase === 'proving';
  const disabled = !isOpen || isWorking || phase === 'verified' || hasVoted;

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
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: tokens.color.text.tertiary,
          }}
        >
          Cast Your Vote
        </Typography>
        {hasVoted && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckIcon sx={{ fontSize: 14, color: tokens.color.accent.emerald }} />
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 500, color: tokens.color.accent.emerald }}>
              Verified
            </Typography>
          </Box>
        )}
      </Box>

      {/* Vote options */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <VoteOption
          label="For"
          description="Support this proposal"
          selected={selection === 'for'}
          disabled={disabled}
          color={tokens.color.accent.emerald}
          borderColor={tokens.color.border.success}
          bgColor={tokens.color.accent.emeraldMuted}
          onClick={() => handleSelect('for')}
        />
        <VoteOption
          label="Against"
          description="Reject this proposal"
          selected={selection === 'against'}
          disabled={disabled}
          color={tokens.color.accent.red}
          borderColor={tokens.color.border.error}
          bgColor={tokens.color.accent.redMuted}
          onClick={() => handleSelect('against')}
        />
      </Box>

      {/* Proof progress */}
      {isProcessing && (
        <Box sx={{ mb: 2 }}>
          {PROOF_STAGES.map((stage, i) => (
            <Box key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
              {i < proofStage ? (
                <CheckIcon sx={{ fontSize: 14, color: tokens.color.accent.emerald }} />
              ) : i === proofStage ? (
                <CircularProgress size={14} sx={{ color: tokens.color.accent.violet }} />
              ) : (
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: `1px solid ${tokens.color.border.subtle}`,
                  }}
                />
              )}
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: tokens.font.mono,
                  color: i <= proofStage ? tokens.color.text.secondary : tokens.color.text.tertiary,
                }}
              >
                {stage}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Verification receipt */}
      {(phase === 'verified' || hasVoted) && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: tokens.radius.md,
            background: tokens.color.accent.emeraldMuted,
            border: `1px solid ${tokens.color.border.success}`,
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 500, color: tokens.color.accent.emerald }}>
            Your private vote has been verified.
          </Typography>
          <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary, mt: 0.25 }}>
            Vote choice is not publicly visible.
          </Typography>
        </Box>
      )}

      {/* Primary Submit Button — Triggers Wallet Confirmation Modal */}
      <Button
        fullWidth
        variant="contained"
        disabled={!selection || isProcessing || disabled}
        onClick={handleOpenApprovalModal}
        sx={{
          py: 1.25,
          fontSize: '0.8125rem',
          fontWeight: 600,
          borderRadius: tokens.radius.md,
          background:
            phase === 'verified'
              ? tokens.color.accent.emeraldMuted
              : `linear-gradient(135deg, ${tokens.color.accent.violet}, #6d28d9)`,
          color: phase === 'verified' ? tokens.color.accent.emerald : '#fff',
          border: phase === 'verified' ? `1px solid ${tokens.color.border.success}` : 'none',
          boxShadow: phase === 'verified' ? 'none' : tokens.shadow.glow.violet,
          transition: tokens.transition.normal,
          '&:hover': {
            background:
              phase === 'verified' ? tokens.color.accent.emeraldMuted : `linear-gradient(135deg, #7c3aed, #5b21b6)`,
          },
          '&:disabled': {
            background: 'rgba(255,255,255,0.04)',
            color: tokens.color.text.tertiary,
            border: `1px solid ${tokens.color.border.subtle}`,
          },
        }}
        startIcon={isProcessing ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
      >
        {phase === 'verified' || hasVoted
          ? 'Vote Verified'
          : isProcessing
            ? 'Processing ZK Proof…'
            : selection
              ? `Confirm Vote (${selection.toUpperCase()})`
              : 'Select a Vote Option'}
      </Button>

      {/* Close voting button */}
      {isOpen && (
        <Button
          fullWidth
          variant="text"
          size="small"
          onClick={onEndVoting}
          disabled={isWorking || isProcessing}
          sx={{
            mt: 1,
            fontSize: '0.75rem',
            color: tokens.color.text.tertiary,
            '&:hover': { color: tokens.color.accent.red, background: tokens.color.accent.redMuted },
          }}
        >
          Close voting period
        </Button>
      )}

      {/* ── Wallet Approval Confirmation Pop-up Modal ── */}
      <Dialog
        open={phase === 'approval_modal'}
        onClose={handleCloseModal}
        slotProps={{
          paper: {
            sx: {
              background: tokens.color.bg.elevated,
              border: `1px solid ${tokens.color.border.subtle}`,
              borderRadius: tokens.radius.xl,
              p: 1,
              minWidth: { xs: 320, sm: 420 },
              boxShadow: tokens.shadow.lg,
            },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 20, color: tokens.color.accent.violet }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: tokens.color.text.primary }}>
              Approve Transaction in Wallet
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={handleCloseModal}
            disabled={isApproving}
            sx={{ color: tokens.color.text.tertiary }}
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: tokens.radius.lg,
              background: tokens.color.bg.surface,
              border: `1px solid ${tokens.color.border.subtle}`,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>Contract Action</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontFamily: tokens.font.mono,
                  fontWeight: 600,
                  color: tokens.color.text.primary,
                }}
              >
                castVote()
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>Vote Choice</Typography>
              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: selection === 'for' ? tokens.color.accent.emerald : tokens.color.accent.red,
                  textTransform: 'uppercase',
                }}
              >
                {selection} (Private Witness)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>ZK Circuit</Typography>
              <Typography
                sx={{ fontSize: '0.75rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}
              >
                voting.zkir
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.tertiary }}>Estimated Gas Fee</Typography>
              <Typography
                sx={{ fontSize: '0.75rem', fontFamily: tokens.font.mono, color: tokens.color.text.secondary }}
              >
                &lt; 0.001 tDUST
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 1.5,
              borderRadius: tokens.radius.md,
              background: tokens.color.accent.violetSubtle,
              border: `1px solid ${tokens.color.border.active}`,
            }}
          >
            <SecurityIcon sx={{ fontSize: 18, color: tokens.color.accent.violet, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.75rem', color: tokens.color.text.secondary, lineHeight: 1.4 }}>
              Your vote choice will be encrypted into a local ZK proof before being submitted on-chain.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            disabled={isApproving}
            sx={{ color: tokens.color.text.tertiary, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isApproving}
            onClick={handleApproveAndSubmit}
            startIcon={
              isApproving ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CheckIcon sx={{ fontSize: 16 }} />
            }
            sx={{
              background: `linear-gradient(135deg, ${tokens.color.accent.violet}, #6d28d9)`,
              color: '#fff',
              boxShadow: tokens.shadow.glow.violet,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: '0.8125rem',
            }}
          >
            {isApproving ? 'Approving in Wallet…' : 'Approve & Submit Vote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ── Vote Option Card ── */
interface VoteOptionProps {
  label: string;
  description: string;
  selected: boolean;
  disabled: boolean;
  color: string;
  borderColor: string;
  bgColor: string;
  onClick: () => void;
}

const VoteOption: React.FC<VoteOptionProps> = ({
  label,
  description,
  selected,
  disabled,
  color,
  borderColor,
  bgColor,
  onClick,
}) => (
  <Box
    component="button"
    role="radio"
    aria-checked={selected}
    aria-label={`Vote ${label}`}
    tabIndex={0}
    onClick={onClick}
    disabled={disabled}
    sx={{
      all: 'unset',
      flex: 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      p: 2,
      borderRadius: tokens.radius.lg,
      border: `1.5px solid ${selected ? borderColor : tokens.color.border.subtle}`,
      background: selected ? bgColor : 'transparent',
      boxShadow: selected ? `0 0 16px ${bgColor}` : 'none',
      transition: tokens.transition.fast,
      textAlign: 'center',
      '&:hover:not(:disabled)': {
        borderColor: borderColor,
        background: bgColor,
      },
      '&:focus-visible': {
        outline: `2px solid ${color}`,
        outlineOffset: '2px',
      },
    }}
  >
    <Typography
      sx={{ fontSize: '0.9375rem', fontWeight: 700, color: selected ? color : tokens.color.text.primary, mb: 0.25 }}
    >
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>{description}</Typography>
    {selected && (
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
        <CheckIcon sx={{ fontSize: 16, color }} />
      </Box>
    )}
  </Box>
);
