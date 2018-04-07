import { DFA } from './finite-state-machine/dfa';
import { NFAe } from './finite-state-machine/nfae';
import { State } from './finite-state-machine/state';

/**
 * @export
 * @class RegularExpresion
 */
export class RegularExpresion {
    public source: string;
    public alphabet: string[];

    /**
     * Creates an instance of RegularExpresion.
     * @param  {string} regExp
     */
    constructor(regExp: string) {
        this.source = regExp;
    }

    /**
     * @return State
     */
    public toNFAe(): State {
        let nfae = NFAe.convert(this.source);
        this.alphabet = nfae.getAlphabet();

        return nfae.getFsm();
    }

    /**
     * Convert to Deterministic Finite Automata (DFA)
     * @return {State}
     */
    public toDFA() {
        let dfa = DFA.convert(this.source);
        this.alphabet = dfa.getAlphabet();

        return dfa.getFsm();
    }
}
