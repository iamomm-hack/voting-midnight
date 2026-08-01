import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  EnvironmentConfiguration,
  getTestEnvironment,
  RemoteTestEnvironment,
  TestEnvironment,
} from "@midnight-ntwrk/testkit-js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { Logger } from "pino";

export interface Config {
  readonly privateStateStoreName: string;
  readonly logDir: string;
  readonly zkConfigPath: string;
  getEnvironment(logger: Logger): TestEnvironment;
  readonly generateDust: boolean;
}

export const currentDir = path.dirname(fileURLToPath(import.meta.url));

export class StandaloneConfig implements Config {
  getEnvironment(logger: Logger): TestEnvironment {
    return getTestEnvironment(logger) as TestEnvironment;
  }
  privateStateStoreName = "voting-private-state";
  logDir = path.resolve(
    currentDir,
    "..",
    "logs",
    "standalone",
    `${new Date().toISOString().replace(/:/g, "-")}.log`,
  );
  zkConfigPath = path.resolve(
    currentDir,
    "..",
    "..",
    "contract",
    "src",
    "managed",
    "voting",
  );
  generateDust = false;
}

export class PreviewRemoteConfig implements Config {
  getEnvironment(logger: Logger): TestEnvironment {
    setNetworkId("preview");
    return new PreviewTestEnvironment(logger);
  }
  privateStateStoreName = "voting-private-state";
  logDir = path.resolve(
    currentDir,
    "..",
    "logs",
    "preview-remote",
    `${new Date().toISOString().replace(/:/g, "-")}.log`,
  );
  zkConfigPath = path.resolve(
    currentDir,
    "..",
    "..",
    "contract",
    "src",
    "managed",
    "voting",
  );
  generateDust = true;
}

export class PreprodRemoteConfig implements Config {
  getEnvironment(logger: Logger): TestEnvironment {
    setNetworkId("preprod");
    return new PreprodTestEnvironment(logger);
  }
  privateStateStoreName = "voting-private-state";
  logDir = path.resolve(
    currentDir,
    "..",
    "logs",
    "preprod-remote",
    `${new Date().toISOString().replace(/:/g, "-")}.log`,
  );
  zkConfigPath = path.resolve(
    currentDir,
    "..",
    "..",
    "contract",
    "src",
    "managed",
    "voting",
  );
  generateDust = true;
}

export class PreviewTestEnvironment extends RemoteTestEnvironment {
  constructor(logger: Logger) {
    super(logger);
    // Bypass default 1000ms health check timeout for remote public endpoints
    (this as any).envHealthCheck = async () => {};
  }

  private getProofServerUrl(): string {
    const container = (this as any).proofServerContainer as
      | { getUrl(): string }
      | undefined;
    if (container) {
      try {
        return container.getUrl();
      } catch {
        // Fall back to port 6300
      }
    }
    return process.env.PROOF_SERVER_URL || "http://localhost:6300";
  }

  getEnvironmentConfiguration(): EnvironmentConfiguration {
    return {
      walletNetworkId: "preview",
      networkId: "preview",
      indexer: "https://indexer.preview.midnight.network/api/v4/graphql",
      indexerWS: "wss://indexer.preview.midnight.network/api/v4/graphql/ws",
      node: "https://rpc.preview.midnight.network",
      nodeWS: "wss://rpc.preview.midnight.network",
      faucet: "https://midnight-tmnight-preview.nethermind.dev/",
      proofServer: this.getProofServerUrl(),
    };
  }
}

export class PreprodTestEnvironment extends RemoteTestEnvironment {
  constructor(logger: Logger) {
    super(logger);
    // Bypass default 1000ms health check timeout for remote public endpoints
    (this as any).envHealthCheck = async () => {};
  }

  private getProofServerUrl(): string {
    const container = (this as any).proofServerContainer as
      | { getUrl(): string }
      | undefined;
    if (container) {
      try {
        return container.getUrl();
      } catch {
        // Fall back to port 6300
      }
    }
    return process.env.PROOF_SERVER_URL || "http://localhost:6300";
  }

  getEnvironmentConfiguration(): EnvironmentConfiguration {
    return {
      walletNetworkId: "preprod",
      networkId: "preprod",
      indexer: "https://indexer.preprod.midnight.network/api/v4/graphql",
      indexerWS: "wss://indexer.preprod.midnight.network/api/v4/graphql/ws",
      node: "https://rpc.preprod.midnight.network",
      nodeWS: "wss://rpc.preprod.midnight.network",
      faucet: "https://midnight-tmnight-preprod.nethermind.dev/",
      proofServer: this.getProofServerUrl(),
    };
  }
}
