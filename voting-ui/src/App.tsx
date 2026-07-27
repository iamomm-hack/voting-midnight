import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/LockOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PollIcon from '@mui/icons-material/Poll';
import SpeedIcon from '@mui/icons-material/Speed';
import { MainLayout, Board } from './components';
import { useDeployedBoardContext } from './hooks';
import { type BoardDeployment } from './contexts';
import { type Observable } from 'rxjs';

const App: React.FC = () => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployments, setBoardDeployments] = useState<Array<Observable<BoardDeployment>>>([]);

  useEffect(() => {
    try {
      const subscription = boardApiProvider.boardDeployments$.subscribe(setBoardDeployments);
      return () => { subscription.unsubscribe(); };
    } catch {
      // Fallback when provider not active
    }
  }, [boardApiProvider]);

  return (
    <MainLayout>
      {/* Hero Title Section */}
      <Box sx={{ textAlign: 'center', mb: 5, pt: 2 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.5, borderRadius: 10, background: 'rgba(124, 77, 255, 0.15)', border: '1px solid rgba(124, 77, 255, 0.3)', mb: 2 }}>
          <Chip label="Rise In Level 1 Builder Challenge" size="small" sx={{ background: '#7c4dff', color: '#fff', fontWeight: 700 }} />
          <Typography variant="caption" sx={{ color: '#b47cff', fontWeight: 600 }}>
            Powered by Midnight Compact ZK
          </Typography>
        </Box>

        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: '-0.03em',
            mb: 1.5,
            background: 'linear-gradient(135deg, #ffffff 0%, #b47cff 50%, #66ffa6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Midnight Privacy Voting DApp
        </Typography>

        <Typography variant="body1" sx={{ color: '#94a3b8', maxWidth: 640, mx: 'auto', lineHeight: 1.6 }}>
          A decentralized governance platform built on Midnight. Individual voter choices remain hidden using zero-knowledge proofs while public tallies stay 100% verifiable on-chain.
        </Typography>
      </Box>

      {/* Feature Highlights Grid */}
      <Grid container spacing={3} sx={{ mb: 5, maxWidth: 1000, mx: 'auto' }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(18, 22, 34, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <LockIcon sx={{ color: '#7c4dff', fontSize: 28, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              100% Private Votes
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Voter key remains secret
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(18, 22, 34, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <VerifiedUserIcon sx={{ color: '#00e676', fontSize: 28, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              zk-SNARK Circuit
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Compact proof verified
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(18, 22, 34, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <PollIcon sx={{ color: '#00b0ff', fontSize: 28, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              Public Tallies
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Verifiable aggregate count
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              textAlign: 'center',
              borderRadius: 3,
              background: 'rgba(18, 22, 34, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <SpeedIcon sx={{ color: '#ffab00', fontSize: 28, mb: 1 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#f8fafc' }}>
              Preprod Testnet
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
              Midnight ledger network
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Voting Card Container */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {boardDeployments.map((boardDeployment, idx) => (
          <Box key={`board-${idx}`} sx={{ mb: 4 }}>
            <Board boardDeployment$={boardDeployment} />
          </Box>
        ))}

        <Board isDemo={true} />
      </Box>
    </MainLayout>
  );
};

export default App;
