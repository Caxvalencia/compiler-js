import { State } from '../state';

export const SEPARATOR: string = '-';

export declare type StateMapped = { [key: string]: string };

/**
 * @export
 * @class DeterministicMapping
 */
export class DeterministicMapping {
  states: StateMapped;
  accepts: Array<string>;

  /**
   * Creates an instance of MapDFA.
   * @constructor
   */
  constructor() {
    this.states = {};
    this.accepts = [];
  }

  /**
   * @static
   * @param  {State} dfa Deterministic Finite Automata
   * @return {DeterministicMapping}
   */
  static apply(dfa: State): DeterministicMapping {
    return new DeterministicMapping().apply(dfa);
  }

  /**
   * @private
   * @param  {State} dfa Deterministic Finite Automata
   * @return {DeterministicMapping}
   */
  private apply(dfa: State): DeterministicMapping {
    if (dfa.isAccepted && this.accepts.indexOf(dfa.id) === -1) {
      this.accepts.push(dfa.id);
    }

    let transitions = dfa.getTransitions();

    for (let key in transitions) {
      const id: string = dfa.id + SEPARATOR + key;

      if (this.states[id]) {
        continue;
      }

      this.states[id] = transitions[key][0].id;
      this.apply(transitions[key][0]);
    }

    return this;
  }
}
