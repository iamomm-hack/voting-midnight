import React, { useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { Box, Button, CardActions, CardContent, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined';
import LinkIcon from '@mui/icons-material/Link';
import LockIcon from '@mui/icons-material/Lock';

export interface EmptyCardContentProps {
  onCreateBoardCallback: () => void;
  onJoinBoardCallback: (contractAddress: ContractAddress) => void;
}

export const EmptyCardContent: React.FC<Readonly<EmptyCardContentProps>> = ({
  onCreateBoardCallback,
  onJoinBoardCallback,
}) => {
  const [textPromptOpen, setTextPromptOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');

  return (
    <React.Fragment>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(124,77,255,0.2), rgba(0,230,118,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            border: '1px solid rgba(124,77,255,0.4)',
          }}
        >
          <LockIcon sx={{ fontSize: 32, color: '#b47cff' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#f8fafc' }}>
          Deploy or Join ZK Contract
        </Typography>
        <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, maxWidth: 320, mx: 'auto' }}>
          Initialize a privacy-preserving Compact voting contract on Midnight Preprod Testnet.
        </Typography>
      </CardContent>

      <CardActions sx={{ px: 4, pb: 4, pt: 0, justifyContent: 'center', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlinedIcon />}
          onClick={onCreateBoardCallback}
          sx={{
            background: 'linear-gradient(135deg, #7c4dff, #651fff)',
            boxShadow: '0 4px 14px 0 rgba(124, 77, 255, 0.4)',
            px: 3,
            py: 1.2,
          }}
        >
          Deploy Proposal Contract
        </Button>

        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={() => setTextPromptOpen(true)}
          sx={{
            borderColor: 'rgba(255,255,255,0.2)',
            color: '#e2e8f0',
            px: 3,
            py: 1.2,
            '&:hover': {
              borderColor: '#00e676',
              color: '#00e676',
            },
          }}
        >
          Join Existing Contract
        </Button>
      </CardActions>

      <Dialog
        open={textPromptOpen}
        onClose={() => setTextPromptOpen(false)}
        slotProps={{
          paper: {
            sx: {
              background: '#121622',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              p: 1,
              minWidth: 360,
            },
          },
        }}
      >
        <DialogTitle sx={{ color: '#f8fafc', fontWeight: 700 }}>Enter Contract Address</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            placeholder="0x..."
            variant="outlined"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            sx={{
              mt: 1,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTextPromptOpen(false)} sx={{ color: '#94a3b8' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!addressInput.trim()}
            onClick={() => {
              setTextPromptOpen(false);
              onJoinBoardCallback(addressInput.trim());
            }}
            sx={{ background: '#7c4dff' }}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};
