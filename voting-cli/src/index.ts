import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import {
  VotingAPI,
  type VotingDerivedState,
  votingPrivateStateKey,
  type VotingProviders,
  type DeployedVotingContract,
  type PrivateStateId,
} from '../../api/src/index';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ledger, type Ledger, VotingState } from '../../contract/src/managed/voting/contract/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider';
import { randomBytes } from '../../api/src/utils';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils';
import { generateDust } from './generate-dust';
import { VotingPrivateState } from '../../contract/src/witnesses.js';

// @ts-expect-error: WebSocket polyfill for apollo
globalThis.WebSocket = WebSocket;

export const getVotingLedgerState = async (
  providers: VotingProviders,
  contractAddress: ContractAddress,
): Promise<Ledger | null> => {
  assertIsContractAddress(contractAddress);
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
  return contractState != null ? ledger(contractState.data) : null;
};

const DEPLOY_OR_JOIN_QUESTION = `
Voting DApp Options:
  1. Deploy a new Voting smart contract
  2. Join an existing Voting smart contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (providers: VotingProviders, rli: Interface, logger: Logger): Promise<VotingAPI | null> => {
  let api: VotingAPI | null = null;

  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1':
        api = await VotingAPI.deploy(providers, logger);
        logger.info(`Deployed Voting contract at address: ${api.deployedContractAddress}`);
        return api;
      case '2':
        api = await VotingAPI.join(providers, await rli.question('What is the contract address (in hex)? '), logger);
        logger.info(`Joined Voting contract at address: ${api.deployedContractAddress}`);
        return api;
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const displayLedgerState = async (
  providers: VotingProviders,
  deployedVotingContract: DeployedVotingContract,
  logger: Logger,
): Promise<void> => {
  const contractAddress = deployedVotingContract.deployTxData.public.contractAddress;
  const ledgerState = await getVotingLedgerState(providers, contractAddress);
  if (ledgerState === null) {
    logger.info(`No voting contract found at ${contractAddress}`);
  } else {
    const status = ledgerState.state === VotingState.VOTING_OPEN ? 'OPEN' : 'ENDED';
    logger.info(`Proposal: 'Community Governance Proposal #1'`);
    logger.info(`Status: '${status}'`);
    logger.info(`Yes Votes: ${ledgerState.yesVotes}`);
    logger.info(`No Votes: ${ledgerState.noVotes}`);
    logger.info(`Total Voters: ${ledgerState.totalVoters}`);
    logger.info(`Sequence: ${ledgerState.sequence}`);
  }
};

const displayPrivateState = async (providers: VotingProviders, logger: Logger): Promise<void> => {
  const privateState = await providers.privateStateProvider.get(votingPrivateStateKey);
  if (privateState === null) {
    logger.info(`No voting private state found`);
  } else {
    logger.info(`Voter Private Secret Key: ${toHex(privateState.secretKey)}`);
  }
};

const MAIN_LOOP_QUESTION = `
Voting Actions:
  1. Cast a YES vote
  2. Cast a NO vote
  3. End voting session
  4. Display current ledger vote tallies
  5. Display private voter key
  6. Exit
Which would you like to do? `;

const mainLoop = async (providers: VotingProviders, rli: Interface, logger: Logger): Promise<void> => {
  const votingApi = await deployOrJoin(providers, rli, logger);
  if (votingApi === null) {
    return;
  }
  let currentState: VotingDerivedState | undefined;
  const stateObserver = {
    next: (state: VotingDerivedState) => (currentState = state),
  };
  const subscription = votingApi.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case '1': {
            await votingApi.castVote(true);
            logger.info('Successfully cast YES vote anonymously via Zero-Knowledge proof!');
            break;
          }
          case '2': {
            await votingApi.castVote(false);
            logger.info('Successfully cast NO vote anonymously via Zero-Knowledge proof!');
            break;
          }
          case '3':
            await votingApi.endVoting();
            logger.info('Voting session ended.');
            break;
          case '4':
            await displayLedgerState(providers, votingApi.deployedContract, logger);
            break;
          case '5':
            await displayPrivateState(providers, logger);
            break;
          case '6':
            logger.info('Exiting...');
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logError(logger, e);
        logger.info('Returning to main menu...');
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

const WALLET_LOOP_QUESTION = `
Wallet Setup:
  1. Build a fresh wallet
  2. Build wallet from a seed
  3. Exit
Which would you like to do? `;

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return GENESIS_MINT_WALLET_SEED;
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    if (config.generateDust) {
      const dustGeneration = await generateDust(logger, seed, unshieldedState, walletFacade);
      if (dustGeneration) {
        logger.info(`Submitted dust generation registration transaction: ${dustGeneration}`);
        await syncWallet(logger, walletFacade);
      }
    }

    const zkConfigProvider = new NodeZkConfigProvider<'castVote' | 'endVoting'>(config.zkConfigPath);
    const providers: VotingProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, VotingPrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => {
          return 'Voting-Test-2026!';
        },
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logError(logger, e);
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logError(logger, e);
    } finally {
      try {
        for (const wallet of providersToBeStopped) {
          logger.info('Stopping wallet...');
          await wallet.stop();
        }
        if (testEnv) {
          logger.info('Stopping test environment...');
          await testEnv.shutdown();
        }
      } catch (e) {
        logError(logger, e);
      }
    }
  }
};

function logError(logger: Logger, e: unknown) {
  if (e instanceof Error) {
    logger.error(`Found error '${e.message}'`);
    logger.debug(`${e.stack}`);
  } else {
    logger.error(`Found error (unknown type)`);
  }
}
