import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { tokens } from '../config/tokens';

type VoteSelection = 'for' | 'against' | null;
type VotePhase = 'idle' | 'confirming' | 'proving' | 'submitting' | 'verified' | 'error';

interface VotingPanelProps {
  isOpen: boolean;
  hasVoted: boolean;
  isWorking: boolean;
  onCastVote: (choice: boolean) => Promise<void>;
  onEndVoting: () => Promise<void>;
}

const PROOF_STAGES = [
  'Preparing private witness…',
  'Generating ZK proof…',
  'Submitting transaction…',
  'Verifying on-chain…',
];

export const VotingPanel: React.FC<VotingPanelProps> = ({
  isOpen,
  hasVoted,
  isWorking,
  onCastVote,
  onEndVoting,
}) => {
  const [selection, setSelection] = useState<VoteSelection>(null);
  const [phase, setPhase] = useState<VotePhase>('idle');
  const [proofStage, setProofStage] = useState(0);

  const handleSelect = (choice: VoteSelection) => {
    if (phase !== 'idle' || !isOpen || hasVoted) return;
    setSelection(choice);
    setPhase('confirming');
  };

  const handleConfirm = async () => {
    if (!selection) return;
    setPhase('proving');

    try {
      for (let i = 0; i < PROOF_STAGES.length; i++) {
        setProofStage(i);
        await new Promise((r) => setTimeout(r, 800));
      }

      await onCastVote(selection === 'for');
      setPhase('verified');
    } catch {
      setPhase('error');
      setTimeout(() => { setPhase('idle'); setSelection(null); }, 2000);
    }
  };

  const handleReset = () => {
    setSelection(null);
    setPhase('idle');
    setProofStage(0);
  };

  const getButtonLabel = () => {
    switch (phase) {
      case 'idle': return selection ? 'Generate private vote' : 'Select a vote';
      case 'confirming': return 'Confirm private vote';
      case 'proving':
      case 'submitting': return PROOF_STAGES[proofStage] || 'Processing…';
      case 'verified': return 'Vote verified';
      case 'error': return 'Failed — retry';
      default: return 'Submit';
    }
  };

  const isProcessing = phase === 'proving' || phase === 'submitting';
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
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${tokens.color.border.subtle}` }} />
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

      {/* Action button */}
      <Button
        fullWidth
        variant="contained"
        disabled={!selection || isProcessing || disabled}
        onClick={phase === 'confirming' ? handleConfirm : handleReset}
        sx={{
          py: 1.25,
          fontSize: '0.8125rem',
          fontWeight: 600,
          borderRadius: tokens.radius.md,
          background: phase === 'verified'
            ? tokens.color.accent.emeraldMuted
            : `linear-gradient(135deg, ${tokens.color.accent.violet}, #6d28d9)`,
          color: phase === 'verified' ? tokens.color.accent.emerald : '#fff',
          border: phase === 'verified' ? `1px solid ${tokens.color.border.success}` : 'none',
          boxShadow: phase === 'verified' ? 'none' : tokens.shadow.glow.violet,
          transition: tokens.transition.normal,
          '&:hover': {
            background: phase === 'verified'
              ? tokens.color.accent.emeraldMuted
              : `linear-gradient(135deg, #7c3aed, #5b21b6)`,
          },
          '&:disabled': {
            background: 'rgba(255,255,255,0.04)',
            color: tokens.color.text.tertiary,
            border: `1px solid ${tokens.color.border.subtle}`,
          },
        }}
        startIcon={isProcessing ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : undefined}
      >
        {getButtonLabel()}
      </Button>

      {/* Close voting */}
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
  label, description, selected, disabled, color, borderColor, bgColor, onClick,
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
    <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: selected ? color : tokens.color.text.primary, mb: 0.25 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.6875rem', color: tokens.color.text.tertiary }}>
      {description}
    </Typography>
    {selected && (
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
        <CheckIcon sx={{ fontSize: 16, color }} />
      </Box>
    )}
  </Box>
);
