import { Operators } from './constants/operators';
import { NonDeterministic } from './non-deterministic';
import { State } from './state';
import { IFiniteStateMachine } from './interfaces/finite-state-machine';

/**
 * @export
 * @class DFA
 */
export class Deterministic implements IFiniteStateMachine {
  private alphabet: string[];
  private nfae: State;
  private dfa: State;
  private stack: Object;

  /**
   * Creates an instance of DFA.
   * @param  {State} nfae
   * @param  {string[]} alphabet
   */
  constructor(nfae: NonDeterministic) {
    this.stack = {};
    this.nfae = nfae.getFsm();
    this.alphabet = nfae.getAlphabet();
  }

  /**
   * @static
   * @param {string} expresion
   * @returns {Deterministic}
   */
  static convert(expresion: string): Deterministic {
    let nfae = NonDeterministic.convert(expresion);

    return new Deterministic(nfae).convert();
  }

  convert(): Deterministic {
    this.indexer()(this.nfae);
    this.dfa = this.findNext(this.closureEpsilon(this.nfae));
    this.indexer()(this.dfa);

    return this;
  }

  getAlphabet(): string[] {
    return this.alphabet;
  }

  getFsm(): State {
    return this.dfa;
  }

  private indexer(index: number = 0) {
    return function _indexer(state: State) {
      if (
        state === null ||
        (state.id !== undefined && state.id.indexOf(',') === -1)
      ) {
        return;
      }

      const transitions = state.getTransitions();
      state.id = index.toString();
      index++;

      for (let transition in transitions) {
        transitions[transition].forEach(_indexer);
      }
    };
  }

  /**
   * Find next states, if finded then it get closures this self
   * @private
   * @param  {State[]} states
   * @return State
   */
  private findNext(states: State[]): State {
    let newStateId = states
      .map(state => state.id)
      .sort()
      .join(',') + ',';

    if (this.stack[newStateId] !== undefined) {
      return this.stack[newStateId];
    }

    let newState = new State();
    newState.id = newStateId;

    this.stack[newStateId] = newState;

    for (const symbol of this.alphabet) {
      if (newState.hasTransition(symbol)) {
        continue;
      }

      let nextStates: State[] = [];

      states.forEach((state: State) => {
        state.process(symbol).forEach(nextState => {
          let closureNextState = this.closureEpsilon(nextState);

          nextStates = nextStates.concat(
            closureNextState.filter(
              state => nextStates.indexOf(state) === -1
            )
          );
        });
      });

      if (nextStates.length > 0) {
        nextStates.sort(
          (current, next) => parseInt(current.id) - parseInt(next.id)
        );

        newState.addTransition(symbol, [this.findNext(nextStates)]);
      }

      newState.isAccepted = states.some(state => state.isAccepted);
    }

    return newState;
  }

  /**
   * @private
   * @param  {State} state
   * @return Array<State>
   */
  private closureEpsilon(state: State): Array<State> {
    let closures = [state];

    const _closureEpsilon = (nextState: State) => {
      if (closures.indexOf(nextState) === -1) {
        closures.push(nextState);
      }

      nextState.process(Operators.EPSILON).forEach(_closureEpsilon);
    };

    state.process(Operators.EPSILON).forEach(_closureEpsilon);

    return closures;
  }
}
