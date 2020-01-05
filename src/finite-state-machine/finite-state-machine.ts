import { SEPARATOR, StateMapped } from './transformers/deterministic-mapping';

export class FiniteStateMachine {
  states: StateMapped;
  accepts: Array<string>;
  isAccepted: boolean;

  private indexStart: number;
  private indexEnd: number;
  private index: number;

  constructor(states: StateMapped, accepts: Array<string>) {
    this.states = states;
    this.accepts = accepts;
    this.index = 0;
  }

  /**
   * @param {string} input
   * @param {number} [stateInitial=0]
   * @returns {boolean}
   */
  process(input: string, stateInitial: string = '0'): boolean {
    this.indexStart = null;
    this.indexEnd = 0;
    this.index = 0;

    return this.run(input.split(''), stateInitial);
  }

  /**
   * @param {string} input
   * @param {number} [currentState=0]
   * @returns {boolean}
   */
  private run(input: string[], currentState: string): boolean {
    const character = input[this.index];

    if (character === undefined) {
      return this.isAcceptedState(currentState);
    }

    const nextState = this.getNextState(currentState, character);

    if (nextState === undefined) {
      this.indexEnd = this.index;

      if (this.indexStart === null) {
        this.index++;

        return this.run(input, currentState);
      }

      return this.isAcceptedState(currentState);
    }

    if (this.indexStart === null) {
      this.indexStart = this.index;
    }

    this.index++;
    this.indexEnd = this.index;

    return this.run(input, nextState);
  }

  /**
   * @param currentState
   * @param character
   */
  private getNextState(currentState: string, character: string) {
    return this.states[currentState + SEPARATOR + character];
  }

  /**
   * @private
   * @param {number} state
   * @returns {boolean}
   */
  private isAcceptedState(state: string): boolean {
    return this.accepts.indexOf(state) !== -1;
  }

  public start() {
    return this.indexStart;
  }

  public end() {
    return this.indexEnd;
  }
}
