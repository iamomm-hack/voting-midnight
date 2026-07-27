// Direct Non-interactive Midnight Preprod Voting Contract Deployment Script
// Uses a FRESH random wallet seed to avoid stale UTXO registration issues.

import axios from 'axios';
import * as crypto from 'node:crypto';
import * as Rx from 'rxjs';
import { WebSocket } from 'ws';
import { createLogger } from '../logger-utils.js';
import { PreprodRemoteConfig } from '../config.js';
import { MidnightWalletProvider } from '../midnight-wallet-provider.js';
import { waitForUnshieldedFunds } from '../wallet-utils.js';
import { generateDust } from '../generate-dust.js';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import {
  VotingAPI,
  votingPrivateStateKey,
  type VotingProviders,
  type PrivateStateId,
} from '../../../api/src/index.js';
import { VotingPrivateState } from '../../../contract/src/witnesses.js';

// Needed to enable WebSocket usage through apollo
// @ts-expect-error: WebSocket polyfill
globalThis.WebSocket = WebSocket;

// Increase HTTP request timeouts to 15 seconds to prevent network timeouts
axios.interceptors.request.use((config) => {
  if (config.timeout && config.timeout <= 2000) {
    config.timeout = 15000;
  }
  return config;
});

// Generate a fresh random seed OR use an env override
const SEED = process.env.WALLET_SEED || crypto.randomBytes(32).toString('hex');

function encodeVerifierKey(raw: Uint8Array): Uint8Array {
  const header = Buffer.from('midnight:verifier-key[v6]:', 'utf-8');
  const keyBuf = Buffer.from(raw.buffer, raw.byteOffset, raw.byteLength);
  if (keyBuf.subarray(0, header.length).equals(header)) {
    return raw;
  }
  const len = keyBuf.length;
  const scaleLen =
    len < 64
      ? Buffer.from([len << 2])
      : Buffer.from([(len << 2) | 1 & 0xff, ((len << 2) | 1) >> 8]);
  return new Uint8Array(Buffer.concat([header, scaleLen, keyBuf]));
}

class TaggedNodeZkConfigProvider extends NodeZkConfigProvider<'castVote' | 'endVoting'> {
  override async getVerifierKey(circuitId: 'castVote' | 'endVoting') {
    const key = await super.getVerifierKey(circuitId);
    return encodeVerifierKey(key) as any;
  }
}

async function main() {
  console.log('[1/6] Initializing Midnight Preprod configuration...');
  const config = new PreprodRemoteConfig();
  const logger = await createLogger(config.logDir);
  const testEnv = config.getEnvironment(logger);

  let walletProvider: MidnightWalletProvider | undefined;
  try {
    console.log('[2/6] Connecting to Midnight Preprod testnet & local Proof Server...');
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);

    console.log(`[3/6] Building FRESH wallet (seed: ${SEED.slice(0, 8)}...)...`);
    console.log(`\n  ⚠️  SAVE THIS SEED: ${SEED}\n`);
    walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, SEED);
    await walletProvider.start();

    console.log('[4/6] Requesting tNight tokens from Preprod Faucet...');
    // fundFromFaucet=true will auto-request tokens from the Nethermind faucet
    const unshieldedState = await waitForUnshieldedFunds(
      logger, walletProvider.wallet, envConfiguration, unshieldedToken(), true,
    );
    const nightBalance = unshieldedState.balances[unshieldedToken().raw] ?? 0n;
    console.log(` -> Wallet NIGHT balance: ${nightBalance}`);
    logger.info(`Wallet NIGHT balance: ${nightBalance}`);

    console.log('[5/6] Registering UTXOs & generating DUST gas tokens...');
    await generateDust(logger, SEED, unshieldedState, walletProvider.wallet);

    console.log(' -> Waiting for DUST gas tokens to settle on-chain (this may take 30-90s)...');
    let pollCount = 0;
    const MAX_POLLS = 60; // 3 minutes max
    await Rx.firstValueFrom(
      Rx.timer(0, 3000).pipe(
        Rx.concatMap(async () => {
          pollCount++;
          try {
            const state = await Rx.firstValueFrom(walletProvider!.wallet.state());
            return state.dust.balance(new Date());
          } catch {
            return 0n;
          }
        }),
        Rx.tap((dustBal) => {
          if (pollCount % 5 === 0 || dustBal > 0n) {
            console.log(`    [${pollCount}/${MAX_POLLS}] Current DUST gas balance: ${dustBal}`);
          }
        }),
        Rx.filter((dustBal) => dustBal > 0n),
        Rx.take(1),
      ),
    );
    console.log(' -> DUST gas confirmed! Proceeding to contract deployment...');

    const zkConfigProvider = new TaggedNodeZkConfigProvider(config.zkConfigPath);
    const providers: VotingProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, VotingPrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => 'Voting-Test-2026!',
        accountId: SEED,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };

    console.log('[6/6] Generating ZK Proofs and deploying Voting contract on-chain...');
    const api = await VotingAPI.deploy(providers, logger);
    console.log('\n==================================================');
    console.log('🎉 DEPLOYMENT SUCCESSFUL!');
    console.log(`Deployed Contract Address: ${api.deployedContractAddress}`);
    console.log(`Wallet Seed: ${SEED}`);
    console.log('==================================================\n');
    logger.info(`Deployed contract at address: ${api.deployedContractAddress}`);
  } catch (err) {
    console.error('❌ Deployment error:', err);
    logger.error(`Deployment failed: ${err}`);
    process.exitCode = 1;
  } finally {
    if (walletProvider) {
      await walletProvider.stop();
    }
    await testEnv.shutdown();
  }
}

main().catch((err) => {
  console.error('Fatal error during deployment:', err);
  process.exit(1);
});
