import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../config/tokens';

export const ProposalOverview: React.FC = () => (
  <Box>
    <Section title="Summary">
      <P>
        This proposal introduces privacy-preserving quadratic voting to the Midnight governance
        framework. By leveraging zero-knowledge proofs generated locally on voter devices, the
        protocol ensures that individual voting choices remain completely private while aggregate
        tallies are publicly verifiable on-chain.
      </P>
    </Section>

    <Section title="Motivation">
      <P>
        Current on-chain governance systems expose voter preferences publicly, creating social
        pressure and enabling vote-buying. Midnight's ZK architecture uniquely enables a system
        where the correctness of the tally can be verified without revealing any individual vote.
      </P>
    </Section>

    <Section title="Privacy guarantees">
      <Box component="ul" sx={{ pl: 2.5, m: 0, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {[
          'Vote choice is encrypted and never leaves the voter\'s device',
          'Voter identity is not disclosed on-chain',
          'ZK proof is generated locally before submission',
          'Aggregate tally is publicly verifiable by any observer',
          'Nullifier prevents double-voting without revealing identity',
        ].map((item) => (
          <Box component="li" key={item} sx={{ color: tokens.color.text.secondary, fontSize: '0.875rem', lineHeight: 1.6 }}>
            {item}
          </Box>
        ))}
      </Box>
    </Section>

    <Section title="Technical specification">
      <P>
        The voting circuit is implemented in Compact and compiled to a zk-SNARK. The witness
        function <Code>disclose(voteChoice)</Code> is invoked inside the circuit, proving the
        voter holds a valid secret key and has not previously voted in this sequence, without
        revealing the key itself. The contract maintains public counters for{' '}
        <Code>yesVotes</Code> and <Code>noVotes</Code> that are incremented atomically.
      </P>
    </Section>
  </Box>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Box sx={{ mb: 3, '&:last-child': { mb: 0 } }}>
    <Typography
      sx={{
        fontSize: '0.6875rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: tokens.color.text.tertiary,
        mb: 1,
      }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography sx={{ fontSize: '0.875rem', color: tokens.color.text.secondary, lineHeight: 1.7 }}>
    {children}
  </Typography>
);

const Code: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box
    component="code"
    sx={{
      fontFamily: tokens.font.mono,
      fontSize: '0.8125rem',
      background: 'rgba(139, 92, 246, 0.1)',
      color: tokens.color.accent.violet,
      px: 0.75,
      py: 0.125,
      borderRadius: tokens.radius.sm,
      border: `1px solid ${tokens.color.accent.violetSubtle}`,
    }}
  >
    {children}
  </Box>
);
