import { Ledger } from "./managed/voting/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";
export type VotingPrivateState = {
    readonly secretKey: Uint8Array;
};
export declare const createVotingPrivateState: (secretKey: Uint8Array) => {
    secretKey: Uint8Array<ArrayBufferLike>;
};
export declare const witnesses: {
    localSecretKey: ({ privateState, }: WitnessContext<Ledger, VotingPrivateState>) => [VotingPrivateState, Uint8Array];
};
