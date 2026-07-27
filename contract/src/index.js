import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";
export * from "./managed/voting/contract/index.js";
export * from "./witnesses";
import * as CompiledVotingContract from "./managed/voting/contract/index.js";
import * as Witnesses from "./witnesses";
export const CompiledVotingContractContract = CompiledContract.make("Voting", CompiledVotingContract.Contract).pipe(CompiledContract.withWitnesses(Witnesses.witnesses), CompiledContract.withCompiledFileAssets("./managed/voting"));
//# sourceMappingURL=index.js.map