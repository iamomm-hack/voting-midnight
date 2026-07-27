import React from 'react';
import { Box, Container } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 50% 0%, rgba(124, 77, 255, 0.12) 0%, rgba(8, 9, 14, 1) 70%)',
        color: '#f8fafc',
        pb: 8,
      }}
    >
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {children}
      </Container>
    </Box>
  );
};
