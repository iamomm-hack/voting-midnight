/**
 * Provides types and utilities for working with Midnight Voting smart contracts.
 *
 * @packageDocumentation
 */

import * as Voting from '../../contract/src/managed/voting/contract/index.js';

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type VotingDerivedState,
  type VotingContract,
  type VotingProviders,
  type DeployedVotingContract,
  votingPrivateStateKey,
  DEFAULT_CONTRACT_ADDRESS,
} from './common-types.js';
import { CompiledVotingContractContract } from '../../contract/src/index';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { VotingPrivateState, createVotingPrivateState } from '../../contract/src/witnesses.js';

export interface DeployedVotingAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;

  castVote: (voteChoice: boolean) => Promise<void>;
  endVoting: () => Promise<void>;
}

export class VotingAPI implements DeployedVotingAPI {
  private constructor(
    public readonly deployedContract: DeployedVotingContract,
    providers: VotingProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = combineLatest(
      [
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => Voting.ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  yesVotes: ledgerState.yesVotes,
                  noVotes: ledgerState.noVotes,
                },
              },
            }),
          ),
        ),
        from(providers.privateStateProvider.get(votingPrivateStateKey) as Promise<VotingPrivateState>),
      ],
      (ledgerState, privateState) => {
        void privateState;
        return {
          state: ledgerState.state,
          proposalTitle: 'Community Governance Proposal #1',
          yesVotes: ledgerState.yesVotes,
          noVotes: ledgerState.noVotes,
          totalVoters: ledgerState.totalVoters,
          sequence: ledgerState.sequence,
        };
      },
    );
  }

  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;

  async castVote(voteChoice: boolean): Promise<void> {
    this.logger?.info(`casting voteChoice: ${voteChoice}`);
    const txData = await this.deployedContract.callTx.castVote(voteChoice);
    this.logger?.trace({
      transactionAdded: {
        circuit: 'castVote',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async endVoting(): Promise<void> {
    this.logger?.info('endingVoting');
    const txData = await this.deployedContract.callTx.endVoting();
    this.logger?.trace({
      transactionAdded: {
        circuit: 'endVoting',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  static async deploy(providers: VotingProviders, logger?: Logger): Promise<VotingAPI> {
    logger?.info('deployContract');

    const deployedVotingContract = await deployContract(providers, {
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: createVotingPrivateState(utils.randomBytes(32)),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedVotingContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedVotingContract, providers, logger);
  }

  static async join(
    providers: VotingProviders,
    contractAddress: ContractAddress = DEFAULT_CONTRACT_ADDRESS,
    logger?: Logger,
  ): Promise<VotingAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedVotingContract = await findDeployedContract<VotingContract>(providers, {
      contractAddress,
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: await VotingAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedVotingContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedVotingContract, providers, logger);
  }

  private static async getPrivateState(
    providers: VotingProviders,
    contractAddress: ContractAddress,
  ): Promise<VotingPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
    return existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
