import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/voting/contract/index.js";
import { type VotingPrivateState, witnesses } from "../witnesses.js";

/** Lightweight local simulator for contract unit tests (no node/proof server). */
export class VotingSimulator {
  readonly contract: Contract<VotingPrivateState>;
  circuitContext: CircuitContext<VotingPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<VotingPrivateState>(witnesses);
    const initial = this.contract.initialState(
      createConstructorContext({ secretKey }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState: initial.currentPrivateState,
      currentZswapLocalState: initial.currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        initial.currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  switchUser(secretKey: Uint8Array): void {
    this.circuitContext.currentPrivateState = { secretKey };
  }

  getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  getPrivateState(): VotingPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  castVote(choice: boolean): Ledger {
    this.circuitContext = this.contract.impureCircuits.castVote(
      this.circuitContext,
      choice,
    ).context;
    return this.getLedger();
  }

  endVoting(): Ledger {
    this.circuitContext = this.contract.impureCircuits.endVoting(
      this.circuitContext,
    ).context;
    return this.getLedger();
  }
}
