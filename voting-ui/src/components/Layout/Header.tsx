import React from 'react';
import { AppBar, Box, Chip, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/LockOutlined';

export const Header: React.FC = () => (
  <AppBar
    position="sticky"
    elevation={0}
    sx={{
      backgroundColor: 'rgba(8, 9, 14, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      px: { xs: 2, md: 6 },
      py: 1.5,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            background: 'linear-gradient(135deg, rgba(124,77,255,0.2), rgba(0,230,118,0.15))',
            border: '1px solid rgba(124,77,255,0.4)',
            px: 2,
            py: 0.8,
            borderRadius: 3,
          }}
        >
          <LockIcon sx={{ color: '#7c4dff' }} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(90deg, #b47cff, #66ffa6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            MIDNIGHT
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: '#94a3b8', fontWeight: 600, borderLeft: '1px solid rgba(255,255,255,0.15)', pl: 1 }}
          >
            Zero-Knowledge Governance
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          icon={<ShieldIcon style={{ color: '#00e676', fontSize: 16 }} />}
          label="ZK Circuit: Active"
          variant="outlined"
          size="small"
          sx={{ borderColor: 'rgba(0,230,118,0.4)', color: '#00e676', fontWeight: 600 }}
        />
        <Chip
          label="Preprod Testnet"
          size="small"
          sx={{
            background: 'rgba(124,77,255,0.2)',
            color: '#b47cff',
            border: '1px solid rgba(124,77,255,0.4)',
            fontWeight: 600,
          }}
        />
      </Box>
    </Box>
  </AppBar>
);
