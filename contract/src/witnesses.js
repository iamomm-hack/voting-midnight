// Voting DApp private state and witness definitions
export const createVotingPrivateState = (secretKey) => ({
    secretKey,
});
export const witnesses = {
    localSecretKey: ({ privateState, }) => [privateState, privateState.secretKey],
};
//# sourceMappingURL=witnesses.js.map