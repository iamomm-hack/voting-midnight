/**
 * Voting DApp common types and abstractions.
 *
 * @module
 */
import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { VotingState, VotingPrivateState, Contract, Witnesses } from '../../contract/src/index';
export declare const DEFAULT_CONTRACT_ADDRESS = "0x02004f8a2e1d7092c4b693e507119280ab4cd09d762d312e75e181d11e891ab0";
export declare const votingPrivateStateKey = "votingPrivateState";
export type PrivateStateId = typeof votingPrivateStateKey;
export type PrivateStates = {
    readonly votingPrivateState: VotingPrivateState;
};
export type VotingContract = Contract<VotingPrivateState, Witnesses<VotingPrivateState>>;
export type VotingCircuitKeys = Exclude<keyof VotingContract['impureCircuits'], number | symbol>;
export type VotingProviders = MidnightProviders<VotingCircuitKeys, PrivateStateId, VotingPrivateState>;
export type DeployedVotingContract = FoundContract<VotingContract>;
export type VotingDerivedState = {
    readonly state: VotingState;
    readonly proposalTitle: string;
    readonly yesVotes: bigint;
    readonly noVotes: bigint;
    readonly totalVoters: bigint;
    readonly sequence: bigint;
};
