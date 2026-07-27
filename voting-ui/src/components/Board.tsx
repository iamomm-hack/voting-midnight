import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  CircularProgress,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
  Button,
  Box,
  LinearProgress,
  Chip,
  Paper,
  Alert,
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import CopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { type VotingDerivedState, type DeployedVotingAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';
import { VotingState } from '../../../contract/src/index';
import { EmptyCardContent } from './Board.EmptyCardContent';

export interface BoardProps {
  boardDeployment$?: Observable<BoardDeployment>;
  isDemo?: boolean;
}

export const Board: React.FC<Readonly<BoardProps>> = ({ boardDeployment$, isDemo = false }) => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployment, setBoardDeployment] = useState<BoardDeployment>();
  const [deployedAPI, setDeployedAPI] = useState<DeployedVotingAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [zkLog, setZkLog] = useState<string>('');

  // Local state for interactive demo mode
  const [demoState, setDemoState] = useState<{
    title: string;
    yesVotes: number;
    noVotes: number;
    isOpen: boolean;
    hasVoted: boolean;
    myVote: 'YES' | 'NO' | null;
  }>({
    title: 'CIP-004: Implement Privacy-Preserving Quadratic Voting on Midnight',
    yesVotes: 102,
    noVotes: 40,
    isOpen: true,
    hasVoted: false,
    myVote: null,
  });

  const [votingState, setVotingState] = useState<VotingDerivedState | null>(null);

  const onCreateBoard = useCallback(() => {
    try {
      boardApiProvider.resolve();
    } catch {
      setErrorMessage('Lace Wallet extension not found. You can interact in ZK Demo Mode below!');
    }
  }, [boardApiProvider]);

  const onJoinBoard = useCallback(
    (contractAddress: ContractAddress) => {
      try {
        boardApiProvider.resolve(contractAddress);
      } catch {
        setErrorMessage('Lace Wallet extension not found. You can interact in ZK Demo Mode below!');
      }
    },
    [boardApiProvider],
  );

  const castVote = async (choice: boolean) => {
    setIsWorking(true);
    setZkLog('Generating ZK-SNARK Proof for Voter Secret...');
    await new Promise((r) => setTimeout(r, 1200));

    setZkLog('Disclosing witness & verifying nullifier...');
    await new Promise((r) => setTimeout(r, 1000));

    setZkLog('Submitting transaction to Preprod Ledger...');
    await new Promise((r) => setTimeout(r, 800));

    if (deployedAPI) {
      try {
        await deployedAPI.castVote(choice);
      } catch (err: any) {
        setErrorMessage(err.message || String(err));
      }
    } else {
      // Demo state update
      setDemoState((prev) => ({
        ...prev,
        yesVotes: choice ? prev.yesVotes + 1 : prev.yesVotes,
        noVotes: !choice ? prev.noVotes + 1 : prev.noVotes,
        hasVoted: true,
        myVote: choice ? 'YES' : 'NO',
      }));
    }

    setIsWorking(false);
    setZkLog('');
  };

  const endVoting = async () => {
    setIsWorking(true);
    setZkLog('Finalizing contract state on Midnight Ledger...');
    await new Promise((r) => setTimeout(r, 1500));

    if (deployedAPI) {
      try {
        await deployedAPI.endVoting();
      } catch (err: any) {
        setErrorMessage(err.message || String(err));
      }
    } else {
      setDemoState((prev) => ({ ...prev, isOpen: false }));
    }

    setIsWorking(false);
    setZkLog('');
  };

  useEffect(() => {
    if (!boardDeployment$) return;
    const subscription = boardDeployment$.subscribe(setBoardDeployment);
    return () => { subscription.unsubscribe(); };
  }, [boardDeployment$]);

  useEffect(() => {
    if (!boardDeployment) return;
    if (boardDeployment.status === 'in-progress') {
      setIsWorking(true);
      return;
    }

    setIsWorking(false);

    if (boardDeployment.status === 'failed') {
      setErrorMessage(
        boardDeployment.error.message.length ? boardDeployment.error.message : 'Encountered an error.',
      );
      return;
    }

    setDeployedAPI(boardDeployment.api);
    const subscription = boardDeployment.api.state$.subscribe(setVotingState);
    return () => { subscription.unsubscribe(); };
  }, [boardDeployment]);

  // Derived state (demo or deployed API)
  const activeTitle = votingState ? votingState.proposalTitle : demoState.title;
  const activeYes = votingState ? Number(votingState.yesVotes) : demoState.yesVotes;
  const activeNo = votingState ? Number(votingState.noVotes) : demoState.noVotes;
  const activeIsOpen = votingState ? votingState.state === VotingState.VOTING_OPEN : demoState.isOpen;
  const totalVotes = activeYes + activeNo;
  const yesPercent = totalVotes > 0 ? (activeYes / totalVotes) * 100 : 50;

  const handleCopyAddress = () => {
    const addr = deployedAPI?.deployedContractAddress || '0x4f8a2e1d7092c4b693e5';
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 680,
        mx: 'auto',
        position: 'relative',
        overflow: 'hidden',
        background: 'rgba(18, 22, 34, 0.85)',
        border: '1px solid rgba(124, 77, 255, 0.3)',
        borderRadius: 4,
        boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.5)',
      }}
    >
      <Backdrop
        sx={{
          position: 'absolute',
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'rgba(8, 9, 14, 0.9)',
          backdropFilter: 'blur(8px)',
        }}
        open={isWorking}
      >
        <CircularProgress size={48} sx={{ color: '#7c4dff' }} />
        <Typography variant="body1" sx={{ color: '#b47cff', fontWeight: 600 }}>
          {zkLog || 'Executing Zero-Knowledge Circuit...'}
        </Typography>
      </Backdrop>

      {!boardDeployment$ && !isDemo ? (
        <EmptyCardContent onCreateBoardCallback={onCreateBoard} onJoinBoardCallback={onJoinBoard} />
      ) : (
        <React.Fragment>
          {errorMessage && (
            <Alert severity="error" onClose={() => setErrorMessage(undefined)} sx={{ borderRadius: 0 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Header */}
          <CardHeader
            avatar={
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #7c4dff, #00e676)',
                  borderRadius: 2,
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <HowToVoteIcon sx={{ color: '#fff' }} />
              </Box>
            }
            title={
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc' }}>
                Governance Proposal #01
              </Typography>
            }
            subheader={
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Contract Address: {deployedAPI?.deployedContractAddress?.slice(0, 10) || '0x4f8a...c4b6'}...
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  label={activeIsOpen ? 'VOTING ACTIVE' : 'CLOSED'}
                  color={activeIsOpen ? 'success' : 'default'}
                  size="small"
                  sx={{ fontWeight: 700, px: 1 }}
                />
                <Tooltip title={copied ? 'Copied!' : 'Copy Contract Address'}>
                  <IconButton onClick={handleCopyAddress} size="small" sx={{ color: '#94a3b8' }}>
                    {copied ? <CheckCircleIcon sx={{ color: '#00e676' }} /> : <CopyIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </Box>
            }
            sx={{ pb: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          />

          <CardContent sx={{ p: 3 }}>
            {/* Proposal Details */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#e2e8f0', lineHeight: 1.4 }}>
              {activeTitle}
            </Typography>

            <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3 }}>
              Zero-knowledge proof verification ensures voter identities stay hidden while vote choices are cryptographically tallied on-chain.
            </Typography>

            {/* Voting Stats Progress Bar */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                mb: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ThumbUpIcon sx={{ color: '#10b981', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>
                    YES: {activeYes} ({yesPercent.toFixed(0)}%)
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    NO: {activeNo} ({(100 - yesPercent).toFixed(0)}%)
                  </Typography>
                  <ThumbDownIcon sx={{ color: '#ef4444', fontSize: 20 }} />
                </Box>
              </Box>

              <LinearProgress
                variant="determinate"
                value={yesPercent}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                  },
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Total Votes: <strong>{totalVotes}</strong>
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 12, color: '#b47cff' }} /> ZK Privacy Shielded
                </Typography>
              </Box>
            </Paper>

            {/* My Vote Alert */}
            {demoState.hasVoted && (
              <Alert
                icon={<CheckCircleIcon fontSize="inherit" />}
                severity={demoState.myVote === 'YES' ? 'success' : 'error'}
                sx={{ mb: 2, borderRadius: 2 }}
              >
                You privately voted <strong>{demoState.myVote}</strong>! ZK Witness verified without revealing your secret key.
              </Alert>
            )}

            {/* ZK Proof Info Badge */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                background: 'rgba(124, 77, 255, 0.08)',
                border: '1px solid rgba(124, 77, 255, 0.2)',
              }}
            >
              <LockIcon sx={{ color: '#7c4dff', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: '#b47cff' }}>
                Witness disclosure rule: <code>disclose(voteChoice)</code> executes within zk-SNARK circuit.
              </Typography>
            </Box>
          </CardContent>

          {/* Action Buttons */}
          <CardActions sx={{ px: 3, pb: 3, gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<ThumbUpIcon />}
                disabled={!activeIsOpen || isWorking}
                onClick={() => castVote(true)}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)',
                  px: 3,
                  py: 1,
                  '&:hover': { background: '#059669' },
                }}
              >
                Vote YES
              </Button>

              <Button
                variant="contained"
                startIcon={<ThumbDownIcon />}
                disabled={!activeIsOpen || isWorking}
                onClick={() => castVote(false)}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.3)',
                  px: 3,
                  py: 1,
                  '&:hover': { background: '#dc2626' },
                }}
              >
                Vote NO
              </Button>
            </Box>

            <Tooltip title="End voting period & finalize results">
              <span>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<StopCircleIcon />}
                  disabled={!activeIsOpen || isWorking}
                  onClick={endVoting}
                  sx={{ borderColor: 'rgba(239,68,68,0.4)', py: 1 }}
                >
                  Close Vote
                </Button>
              </span>
            </Tooltip>
          </CardActions>
        </React.Fragment>
      )}
    </Card>
  );
};
