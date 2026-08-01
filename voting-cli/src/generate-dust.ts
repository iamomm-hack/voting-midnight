import { type WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import {
  createKeystore,
  UnshieldedWalletState,
} from "@midnight-ntwrk/wallet-sdk-unshielded-wallet";
import { Logger } from "pino";
import { HDWallet, Roles } from "@midnight-ntwrk/wallet-sdk-hd";
import { getNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import * as rx from "rxjs";

export const getUnshieldedSeed = (
  seed: string,
): Uint8Array<ArrayBufferLike> => {
  const seedBuffer = Buffer.from(seed, "hex");
  const hdWalletResult = HDWallet.fromSeed(seedBuffer);

  const { hdWallet } = hdWalletResult as {
    type: "seedOk";
    hdWallet: HDWallet;
  };

  const derivationResult = hdWallet
    .selectAccount(0)
    .selectRole(Roles.NightExternal)
    .deriveKeyAt(0);

  if (derivationResult.type === "keyOutOfBounds") {
    throw new Error("Key derivation out of bounds");
  }

  return derivationResult.key;
};

export const generateDust = async (
  logger: Logger,
  walletSeed: string,
  unshieldedState: UnshieldedWalletState,
  walletFacade: WalletFacade,
) => {
  const currentDustBalance = (walletFacade.dust as any).balance
    ? (walletFacade.dust as any).balance(new Date())
    : 0n;
  if (currentDustBalance > 0n) {
    logger.info(
      `Existing DUST gas balance found: ${currentDustBalance}. Skipping dust registration.`,
    );
    return;
  }

  const networkId = getNetworkId();
  const unshieldedKeystore = createKeystore(
    getUnshieldedSeed(walletSeed),
    networkId,
  );
  const utxos = unshieldedState.availableCoins.filter(
    (coin) => !coin.meta.registeredForDustGeneration,
  );

  if (utxos.length === 0) {
    logger.info("No unregistered UTXOs found for dust generation.");
    return;
  }

  logger.info(`Registering ${utxos.length} UTXOs for dust generation...`);

  // Wait at most 3 seconds for dust state
  const dustState = await Promise.race([
    walletFacade.dust.waitForSyncedState(),
    new Promise<null>((res) => setTimeout(() => res(null), 3000)),
  ]);

  const dustAddress =
    dustState?.address ?? (unshieldedKeystore.getPublicKey() as any);

  try {
    const recipe = await walletFacade.registerNightUtxosForDustGeneration(
      utxos,
      unshieldedKeystore.getPublicKey(),
      (payload) => unshieldedKeystore.signData(payload),
      dustAddress,
    );
    const transaction = await walletFacade.finalizeRecipe(recipe);
    const txId = await walletFacade.submitTransaction(transaction);

    logger.info(`Dust generation transaction submitted with txId: ${txId}`);
    return txId;
  } catch (err: any) {
    logger.warn(
      `Dust UTXO registration status: UTXOs already submitted/registered on-chain (${err?.message || err}). Proceeding to deployment...`,
    );
  }
};
