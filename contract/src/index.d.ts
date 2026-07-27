import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
export * from "./managed/voting/contract/index.js";
export * from "./witnesses";
import * as CompiledVotingContract from "./managed/voting/contract/index.js";
import * as Witnesses from "./witnesses";
export declare const CompiledVotingContractContract: CompiledContract.CompiledContract<CompiledVotingContract.Contract<Witnesses.VotingPrivateState, CompiledVotingContract.Witnesses<Witnesses.VotingPrivateState>>, Witnesses.VotingPrivateState, never>;
