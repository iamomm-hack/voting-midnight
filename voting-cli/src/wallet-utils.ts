import { UnshieldedTokenType } from "@midnight-ntwrk/midnight-js-protocol/ledger";
import {
  type FacadeState,
  type WalletFacade,
} from "@midnight-ntwrk/wallet-sdk-facade";
import {
  type ShieldedWalletAPI,
  type ShieldedWalletState,
} from "@midnight-ntwrk/wallet-sdk-shielded";
import {
  type UnshieldedWalletAPI,
  type UnshieldedWalletState,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import * as Rx from "rxjs";

import {
  FaucetClient,
  type EnvironmentConfiguration,
} from "@midnight-ntwrk/testkit-js";
import { Logger } from "pino";
import { UnshieldedAddress } from "@midnight-ntwrk/wallet-sdk-address-format";
import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export const getInitialShieldedState = async (
  logger: Logger,
  wallet: ShieldedWalletAPI,
): Promise<ShieldedWalletState> => {
  logger.info("Getting initial state of wallet...");
  return Rx.firstValueFrom(wallet.state);
};

export const getInitialUnshieldedState = async (
  logger: Logger,
  wallet: UnshieldedWalletAPI,
): Promise<UnshieldedWalletState> => {
  logger.info("Getting initial state of wallet...");
  return Rx.firstValueFrom(wallet.state);
};

const isProgressStrictlyComplete = (progress: unknown): boolean => {
  if (!progress || typeof progress !== "object") {
    return false;
  }
  const candidate = progress as { isStrictlyComplete?: unknown };
  if (typeof candidate.isStrictlyComplete !== "function") {
    return false;
  }
  return (candidate.isStrictlyComplete as () => boolean)();
};

const isFacadeStateSynced = (state: FacadeState): boolean =>
  isProgressStrictlyComplete(state.shielded.state.progress) &&
  isProgressStrictlyComplete(state.dust.state.progress) &&
  isProgressStrictlyComplete(state.unshielded.progress);

export const syncWallet = (
  logger: Logger,
  wallet: WalletFacade,
  throttleTime = 2_000,
) => {
  logger.info("Syncing wallet...");

  return Rx.firstValueFrom(
    wallet.state().pipe(
      Rx.tap((state: FacadeState) => {
        const shieldedSynced = isProgressStrictlyComplete(
          state.shielded.state.progress,
        );
        const unshieldedSynced = isProgressStrictlyComplete(
          state.unshielded.progress,
        );
        const dustSynced = isProgressStrictlyComplete(
          state.dust.state.progress,
        );
        logger.debug(
          `Wallet synced state emission: { shielded=${shieldedSynced}, unshielded=${unshieldedSynced}, dust=${dustSynced} }`,
        );
      }),
      Rx.throttleTime(throttleTime),
      Rx.tap((state: FacadeState) => {
        const shieldedSynced = isProgressStrictlyComplete(
          state.shielded.state.progress,
        );
        const unshieldedSynced = isProgressStrictlyComplete(
          state.unshielded.progress,
        );
        const dustSynced = isProgressStrictlyComplete(
          state.dust.state.progress,
        );
        const isSynced = shieldedSynced && dustSynced && unshieldedSynced;

        logger.debug(
          `Wallet synced state emission (synced=${isSynced}): { shielded=${shieldedSynced}, unshielded=${unshieldedSynced}, dust=${dustSynced} }`,
        );
      }),
      Rx.filter((state: FacadeState) => isFacadeStateSynced(state)),
      Rx.tap(() => logger.info("Sync complete")),
      Rx.tap((state: FacadeState) => {
        const shieldedBalances = state.shielded.balances || {};
        const unshieldedBalances = state.unshielded.balances || {};
        const dustBalances = state.dust.balance(new Date(Date.now())) || 0n;

        logger.info(
          `Wallet balances after sync - Shielded: ${JSON.stringify(shieldedBalances)}, Unshielded: ${JSON.stringify(unshieldedBalances)}, Dust: ${dustBalances}`,
        );
      }),
    ),
  );
};

export const waitForUnshieldedFunds = async (
  logger: Logger,
  wallet: WalletFacade,
  env: EnvironmentConfiguration,
  tokenType: UnshieldedTokenType,
  fundFromFaucet = false,
  throttleTime = 1_000,
): Promise<UnshieldedWalletState> => {
  const initialState = await getInitialUnshieldedState(
    logger,
    wallet.unshielded,
  );
  const unshieldedAddress = UnshieldedAddress.codec.encode(
    getNetworkId(),
    initialState.address,
  );
  logger.info(`Using unshielded address: ${unshieldedAddress.toString()}`);

  if (fundFromFaucet && env.faucet) {
    try {
      logger.info(
        `Requesting tokens from faucet for ${unshieldedAddress.toString()}...`,
      );
      await new FaucetClient(env.faucet, logger).requestTokens(
        unshieldedAddress.toString(),
      );
    } catch {
      // Ignore if Cloudflare protected or already requested
    }
  }

  const initialBalance = initialState.balances[tokenType.raw];
  if (initialBalance !== undefined && initialBalance > 0n) {
    logger.info(`Existing wallet balance found: ${initialBalance}`);
    return initialState;
  }

  logger.info(
    `Initial balance is 0. Polling wallet state for testnet token arrival...`,
  );

  return Rx.firstValueFrom(
    Rx.timer(0, 2000).pipe(
      Rx.concatMap(async () => {
        try {
          return await Rx.firstValueFrom(wallet.unshielded.state);
        } catch {
          return null;
        }
      }),
      Rx.filter((state): state is UnshieldedWalletState => {
        if (!state) return false;
        const balance = state.balances[tokenType.raw] ?? 0n;
        return balance > 0n;
      }),
      Rx.tap((state) => {
        logger.info(
          `Funds confirmed! Balance: ${state.balances[tokenType.raw]}`,
        );
      }),
    ),
  );
};
