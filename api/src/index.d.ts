/**
 * Provides types and utilities for working with Midnight Voting smart contracts.
 *
 * @packageDocumentation
 */
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import { type VotingDerivedState, type VotingProviders, type DeployedVotingContract } from './common-types.js';
import { type Observable } from 'rxjs';
export interface DeployedVotingAPI {
    readonly deployedContractAddress: ContractAddress;
    readonly state$: Observable<VotingDerivedState>;
    castVote: (voteChoice: boolean) => Promise<void>;
    endVoting: () => Promise<void>;
}
export declare class VotingAPI implements DeployedVotingAPI {
    readonly deployedContract: DeployedVotingContract;
    private readonly logger?;
    private constructor();
    readonly deployedContractAddress: ContractAddress;
    readonly state$: Observable<VotingDerivedState>;
    castVote(voteChoice: boolean): Promise<void>;
    endVoting(): Promise<void>;
    static deploy(providers: VotingProviders, logger?: Logger): Promise<VotingAPI>;
    static join(providers: VotingProviders, contractAddress?: ContractAddress, logger?: Logger): Promise<VotingAPI>;
    private static getPrivateState;
}
export * as utils from './utils/index.js';
export * from './common-types.js';
