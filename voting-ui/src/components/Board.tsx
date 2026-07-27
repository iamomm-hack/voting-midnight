import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Box, Typography, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { type VotingDerivedState, type DeployedVotingAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { VotingState } from '../../../contract/src/index';
import { tokens } from '../config/tokens';

import { ProposalHeader } from './ProposalHeader';
import { ProposalOverview } from './ProposalOverview';
import { ResultsVisualization } from './ResultsVisualization';
import { VotingPanel } from './VotingPanel';
import { PrivacyGuarantee } from './PrivacyGuarantee';
import { OnChainActivity } from './OnChainActivity';

export interface BoardProps {
  boardDeployment$?: Observable<BoardDeployment>;
  isDemo?: boolean;
}

export const Board: React.FC<Readonly<BoardProps>> = ({ boardDeployment$, isDemo = false }) => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedAPI, setDeployedAPI] = useState<DeployedVotingAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [isWorking, setIsWorking] = useState(false);

  // Demo state
  const [demoState, setDemoState] = useState({
    title: 'CIP-004 — Privacy-Preserving Quadratic Voting',
    yesVotes: 102,
    noVotes: 40,
    isOpen: true,
    hasVoted: false,
  });

  const [votingState, setVotingState] = useState<VotingDerivedState | null>(null);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const onCreateBoard = useCallback(() => {
    try {
      boardApiProvider.resolve();
    } catch {
      setErrorMessage('Midnight Lace wallet not found. Displaying interactive preview.');
    }
  }, [boardApiProvider]);

  const onJoinBoard = useCallback(
    (contractAddress: ContractAddress) => {
      try {
        boardApiProvider.resolve(contractAddress);
      } catch {
        setErrorMessage('Midnight Lace wallet not found. Displaying interactive preview.');
      }
    },
    [boardApiProvider],
  );

  const castVote = async (choice: boolean) => {
    setIsWorking(true);
    if (deployedAPI) {
      try {
        await deployedAPI.castVote(choice);
      } catch (err: any) {
        setErrorMessage(err.message || String(err));
      }
    } else {
      // Demo
      await new Promise((r) => setTimeout(r, 3000));
      setDemoState((prev) => ({
        ...prev,
        yesVotes: choice ? prev.yesVotes + 1 : prev.yesVotes,
        noVotes: !choice ? prev.noVotes + 1 : prev.noVotes,
        hasVoted: true,
      }));
    }
    setIsWorking(false);
  };

  const endVoting = async () => {
    setIsWorking(true);
    if (deployedAPI) {
      try {
        await deployedAPI.endVoting();
      } catch (err: any) {
        setErrorMessage(err.message || String(err));
      }
    } else {
      await new Promise((r) => setTimeout(r, 1500));
      setDemoState((prev) => ({ ...prev, isOpen: false }));
    }
    setIsWorking(false);
  };

  // Subscriptions
  useEffect(() => {
    if (!boardDeployment$) return;
    const sub = boardDeployment$.subscribe(setBoardDeployment);
    return () => sub.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment) return;
    if (boardDeployment.status === 'in-progress') { setIsWorking(true); return; }
    setIsWorking(false);
    if (boardDeployment.status === 'failed') {
      setErrorMessage(boardDeployment.error.message || 'Encountered an error.');
      return;
    }
    setDeployedAPI(boardDeployment.api);
    const sub = boardDeployment.api.state$.subscribe(setVotingState);
    return () => sub.unsubscribe();
  }, [boardDeployment]);

  // Derived state
  const title = votingState ? votingState.proposalTitle : demoState.title;
  const yesVotes = votingState ? Number(votingState.yesVotes) : demoState.yesVotes;
  const noVotes = votingState ? Number(votingState.noVotes) : demoState.noVotes;
  const isOpen = votingState ? votingState.state === VotingState.VOTING_OPEN : demoState.isOpen;
  const hasVoted = demoState.hasVoted;
  const totalVotes = yesVotes + noVotes;
  const contractAddr = deployedAPI?.deployedContractAddress || '0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0';

  // Empty state — no deployment
  if (!boardDeployment$ && !isDemo) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontSize: '0.875rem', color: tokens.color.text.tertiary, mb: 3 }}>
          Deploy a new contract or join an existing one to begin.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={onCreateBoard}
            sx={{
              background: `linear-gradient(135deg, ${tokens.color.accent.violet}, #6d28d9)`,
              boxShadow: tokens.shadow.glow.violet,
              px: 3,
              py: 1,
            }}
          >
            Deploy contract
          </Button>
          <Button
            variant="outlined"
            onClick={() => setJoinDialogOpen(true)}
            sx={{
              borderColor: tokens.color.border.default,
              color: tokens.color.text.secondary,
              '&:hover': { borderColor: tokens.color.accent.violet, color: tokens.color.text.primary },
            }}
          >
            Join existing
          </Button>
        </Box>

        <Dialog
          open={joinDialogOpen}
          onClose={() => setJoinDialogOpen(false)}
          slotProps={{
            paper: {
              sx: {
                background: tokens.color.bg.elevated,
                border: `1px solid ${tokens.color.border.subtle}`,
                borderRadius: tokens.radius.xl,
                p: 1,
                minWidth: 400,
              },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem' }}>Enter contract address</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              placeholder="0x…"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  fontFamily: tokens.font.mono,
                  fontSize: '0.8125rem',
                  color: tokens.color.text.primary,
                  background: tokens.color.bg.surface,
                  borderRadius: tokens.radius.md,
                  '& fieldset': { borderColor: tokens.color.border.subtle },
                  '&:hover fieldset': { borderColor: tokens.color.border.active },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setJoinDialogOpen(false)} sx={{ color: tokens.color.text.tertiary }}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!addressInput.trim()}
              onClick={() => { setJoinDialogOpen(false); onJoinBoard(addressInput.trim()); }}
              sx={{ background: tokens.color.accent.violet }}
            >
              Connect
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Tabs
  const tabs = ['Overview', 'Discussion', 'Specification', 'Activity'];

  return (
    <Box>
      {/* Error banner */}
      {errorMessage && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            borderRadius: tokens.radius.md,
            background: tokens.color.accent.redMuted,
            border: `1px solid ${tokens.color.border.error}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: '0.8125rem', color: tokens.color.accent.red }}>{errorMessage}</Typography>
          <Button size="small" onClick={() => setErrorMessage(undefined)} sx={{ color: tokens.color.accent.red, minWidth: 'auto' }}>
            ✕
          </Button>
        </Box>
      )}

      <ProposalHeader title={title} isOpen={isOpen} contractAddress={contractAddr} />

      {/* Tabs */}
      <Box
        role="tablist"
        sx={{
          display: 'flex',
          gap: 0,
          borderBottom: `1px solid ${tokens.color.border.subtle}`,
          mb: 3,
          overflow: 'auto',
        }}
      >
        {tabs.map((tab, i) => (
          <Box
            key={tab}
            role="tab"
            aria-selected={activeTab === i}
            tabIndex={0}
            onClick={() => setActiveTab(i)}
            onKeyDown={(e) => e.key === 'Enter' && setActiveTab(i)}
            sx={{
              px: 2,
              py: 1.25,
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: activeTab === i ? tokens.color.text.primary : tokens.color.text.tertiary,
              borderBottom: activeTab === i ? `2px solid ${tokens.color.accent.violet}` : '2px solid transparent',
              cursor: 'pointer',
              transition: tokens.transition.fast,
              flexShrink: 0,
              '&:hover': { color: tokens.color.text.secondary },
              '&:focus-visible': { outline: `2px solid ${tokens.color.accent.violet}`, outlineOffset: '-2px' },
            }}
          >
            {tab}
          </Box>
        ))}
      </Box>

      {/* Content grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 340px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Main content */}
        <Box>
          {activeTab === 0 && <ProposalOverview />}
          {activeTab === 1 && (
            <Typography sx={{ fontSize: '0.875rem', color: tokens.color.text.tertiary, py: 4 }}>
              Discussion is not yet available for this proposal.
            </Typography>
          )}
          {activeTab === 2 && (
            <Box sx={{ py: 2 }}>
              <Box
                component="pre"
                sx={{
                  fontFamily: tokens.font.mono,
                  fontSize: '0.75rem',
                  color: tokens.color.text.secondary,
                  background: tokens.color.bg.surface,
                  border: `1px solid ${tokens.color.border.subtle}`,
                  borderRadius: tokens.radius.md,
                  p: 2,
                  overflow: 'auto',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
{`circuit voting {
  state VotingState { VOTING_OPEN, VOTING_ENDED }
  
  ledger {
    proposalTitle: Bytes<32>;
    yesVotes: Counter;
    noVotes: Counter;
    state: VotingState;
    admin: Bytes<32>;
  }

  castVote(voteChoice: Boolean) {
    assert(state == VOTING_OPEN);
    disclose(voteChoice);
    if (voteChoice) yesVotes += 1;
    else noVotes += 1;
  }
}`}
              </Box>
            </Box>
          )}
          {activeTab === 3 && <OnChainActivity totalVotes={totalVotes} isOpen={isOpen} />}

          {/* Activity always visible below overview */}
          {activeTab === 0 && <OnChainActivity totalVotes={totalVotes} isOpen={isOpen} />}
        </Box>

        {/* Right panel */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            position: { lg: 'sticky' },
            top: { lg: 68 },
          }}
        >
          <ResultsVisualization yesVotes={yesVotes} noVotes={noVotes} isOpen={isOpen} />
          <VotingPanel
            isOpen={isOpen}
            hasVoted={hasVoted}
            isWorking={isWorking}
            onCastVote={castVote}
            onEndVoting={endVoting}
          />
          <PrivacyGuarantee />
        </Box>
      </Box>
    </Box>
  );
};
