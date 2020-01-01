import { Deterministic } from './finite-state-machine/deterministic';
import { NonDeterministic } from './finite-state-machine/non-deterministic';
import { State } from './finite-state-machine/state';
import { DeterministicMapping } from './finite-state-machine/transformers/deterministic-mapping';
import { FiniteStateMachine } from './finite-state-machine/finite-state-machine';

export interface Matched {
  isValid: boolean;
  finded: string;
  start: number;
  end: number;
  input: string;
}

declare type Flags = 'g' | 'u';

/**
 * @export
 * @class RegularExpresion
 */
export class RegularExpresion {
  public source: string;

  public alphabet: string[];

  public flags: string[];

  /**
   * Creates an instance of RegularExpresion.
   * @param {string} regExp
   */
  constructor(regExp: string, flags?: Flags) {
    this.source = regExp;
    this.setFlags(flags);
  }

  /**
   * @return State
   */
  public toNonDeterministic(): State {
    let nfae = NonDeterministic.convert(this.source);
    this.alphabet = nfae.getAlphabet();

    return nfae.getFsm();
  }

  /**
   * Convert to Deterministic Finite Automata (DFA)
   * @return {State}
   */
  public toDeterministic(): State {
    let dfa = Deterministic.convert(this.source);
    this.alphabet = dfa.getAlphabet();

    return dfa.getFsm();
  }

  /**
   * @param {string} text
   * @returns {Matched}
   */
  public match(text: string): Matched {
    const dfa = this.toDeterministic();
    const mapped = DeterministicMapping.apply(dfa);
    const fsm = new FiniteStateMachine(mapped.states, mapped.accepts);

    return <Matched>{
      isValid: fsm.process(text),
      finded: text.substring(fsm.start(), fsm.end()),
      start: fsm.start(),
      end: fsm.end(),
      input: text
    };
  }

  setFlags(flags: Flags) {
    if (flags) {
      this.flags = flags.toLocaleLowerCase().split('');
    }
  }
}
