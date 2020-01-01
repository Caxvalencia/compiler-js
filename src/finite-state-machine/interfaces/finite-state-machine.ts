import { State } from '../state';

export interface IFiniteStateMachine {
  /**
   * @returns {IFiniteStateMachine}
   */
  convert(): any;

  /**
   * @returns {string[]}
   */
  getAlphabet(): string[];

  /**
   * @returns {State}
   */
  getFsm(): State;
}
