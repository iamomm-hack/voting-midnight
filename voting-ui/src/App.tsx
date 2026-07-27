import React, { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { TopNavigation, GovernanceOverview, Board, OnChainActivity, DocsView } from './components';
import { useDeployedBoardContext } from './hooks';
import { type BoardDeployment } from './contexts';
import { type Observable } from 'rxjs';
import { tokens } from './config/tokens';

type NavTab = 'proposals' | 'activity' | 'docs';

const App: React.FC = () => {
  const boardApiProvider = useDeployedBoardContext();
  const [boardDeployments, setBoardDeployments] = useState<Array<Observable<BoardDeployment>>>([]);
  const [activeTab, setActiveTab] = useState<NavTab>('proposals');

  // Demo state for overview stats
  const [totalVotes] = useState(142);
  const [isOpen] = useState(true);

  useEffect(() => {
    try {
      const subscription = boardApiProvider.boardDeployments$.subscribe(setBoardDeployments);
      return () => {
        subscription.unsubscribe();
      };
    } catch {
      // Fallback when provider not active
    }
  }, [boardApiProvider]);

  return (
    <Box sx={{ minHeight: '100vh', background: tokens.color.bg.base }}>
      <TopNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <Container
        maxWidth="lg"
        sx={{
          px: { xs: 2, md: 4 },
          py: 4,
        }}
      >
        {activeTab === 'proposals' && (
          <>
            <GovernanceOverview totalVotes={totalVotes} isOpen={isOpen} />

            <Box sx={{ py: 4 }}>
              {boardDeployments.map((boardDeployment, idx) => (
                <Box key={`board-${idx}`} sx={{ mb: 4 }}>
                  <Board boardDeployment$={boardDeployment} />
                </Box>
              ))}

              <Board isDemo={true} />
            </Box>
          </>
        )}

        {activeTab === 'activity' && (
          <Box sx={{ py: 2 }}>
            <OnChainActivity />
          </Box>
        )}

        {activeTab === 'docs' && (
          <Box sx={{ py: 2 }}>
            <DocsView />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default App;
