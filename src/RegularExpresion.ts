import { Operators } from './finite-state-machine/constants/operators';
import { DFA } from './finite-state-machine/dfa';
import { State } from './finite-state-machine/state';
import { ConcatFsm } from './finite-state-machine/transformers/concat-fsm';
import { KleeneFsm } from './finite-state-machine/transformers/kleene-fsm';
import { SimpleFsm } from './finite-state-machine/transformers/simple-fsm';
import { UnionFsm } from './finite-state-machine/transformers/union-fsm';

/**
 * @export
 * @class RegularExpresion
 */
export class RegularExpresion {
    public source: string;
    public alphabet: string[];
    protected separator: string = '-';

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
        let initialFsm: SimpleFsm;
        let fsm: SimpleFsm;
        let beforeFsm: SimpleFsm = null;
        let beforeChar = null;
        let alphabet = {};

        this.source.split('').forEach((character, idx) => {
            if (character === Operators.ZERO_OR_MANY) {
                fsm = KleeneFsm.apply(fsm);
                beforeFsm = fsm;

                return;
            }

            if (character === Operators.OR) {
                beforeChar = character;

                return;
            }

            //Stack?
            if (beforeChar === Operators.OR) {
                initialFsm = UnionFsm.apply(fsm, new SimpleFsm(character));
                fsm = UnionFsm.fsmSecond;
                beforeChar = character;

                return;
            }

            fsm = new SimpleFsm(character);

            if (beforeFsm !== null) {
                ConcatFsm.apply(beforeFsm, fsm);
            }

            beforeFsm = fsm;
            beforeChar = character;

            alphabet[character] = character;

            if (idx === 0) {
                initialFsm = fsm;
            }
        });

        this.alphabet = Object.getOwnPropertyNames(alphabet);

        return initialFsm.init;
    }

    /**
     * Convert to Deterministic Finite Automata (DFA)
     * @return {State}
     */
    public toDFA() {
        return DFA.convert(this.toNFAe(), this.alphabet);
    }
}
