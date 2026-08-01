import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, expect, it } from "vitest";
import { VotingState } from "../managed/voting/contract/index.js";
import { randomBytes } from "./utils.js";
import { VotingSimulator } from "./voting-simulator.js";

setNetworkId("undeployed");

describe("Midnight private voting contract", () => {
  it("initializes an open poll with empty public tallies", () => {
    const simulator = new VotingSimulator(randomBytes(32));
    const ledger = simulator.getLedger();

    expect(ledger.state).toBe(VotingState.VOTING_OPEN);
    expect(ledger.yesVotes).toBe(0n);
    expect(ledger.noVotes).toBe(0n);
    expect(ledger.totalVoters).toBe(0n);
    expect(ledger.sequence).toBe(1n);
    expect(ledger.usedNullifiers.size).toBe(0n);
  });

  it("records YES and NO ballots in publicly verifiable tallies", () => {
    const simulator = new VotingSimulator(randomBytes(32));
    simulator.castVote(true);
    simulator.switchUser(randomBytes(32));
    const ledger = simulator.castVote(false);

    expect(ledger.yesVotes).toBe(1n);
    expect(ledger.noVotes).toBe(1n);
    expect(ledger.totalVoters).toBe(2n);
    expect(ledger.usedNullifiers.size).toBe(2n);
  });

  it("keeps the local secret unchanged when a ballot is cast", () => {
    const secretKey = randomBytes(32);
    const simulator = new VotingSimulator(secretKey);

    simulator.castVote(true);

    expect(simulator.getPrivateState()).toEqual({ secretKey });
  });

  it("rejects a second ballot from the same private identity", () => {
    const simulator = new VotingSimulator(randomBytes(32));
    simulator.castVote(true);

    expect(() => simulator.castVote(false)).toThrow(
      "failed assert: This voting identity has already voted",
    );
  });

  it("allows only the poll administrator to close voting", () => {
    const adminSecret = randomBytes(32);
    const simulator = new VotingSimulator(adminSecret);
    simulator.switchUser(randomBytes(32));

    expect(() => simulator.endVoting()).toThrow(
      "failed assert: Only the poll administrator can end voting",
    );

    simulator.switchUser(adminSecret);
    expect(simulator.endVoting().state).toBe(VotingState.ENDED);
  });

  it("rejects ballots after the administrator closes voting", () => {
    const simulator = new VotingSimulator(randomBytes(32));
    simulator.endVoting();

    expect(() => simulator.castVote(true)).toThrow(
      "failed assert: Voting round is not open",
    );
  });
});
