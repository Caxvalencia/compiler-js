import { Operators } from './finite-state-machine/constants/operators';
import { NFAeToDFA } from './finite-state-machine/nfae-to-dfa';
import { ConcatFsm } from './finite-state-machine/transformers/concat-fsm';
import { KleeneFsm } from './finite-state-machine/transformers/kleene-fsm';
import { SimpleFsm } from './finite-state-machine/transformers/simple-fsm';
import { UnionFsm } from './finite-state-machine/transformers/union-fsm';

declare let console;

export class RegularExpresion {
    public source: string;
    public alphabet: Object;
    protected separator: string = '-';

    constructor(regExp: string) {
        this.source = regExp;
        this.alphabet = {};
    }

    /**
     * @return {SimpleFsm}
     */
    public toNFAe(): SimpleFsm {
        let initialFsm: SimpleFsm;
        let fsm: SimpleFsm;
        let beforeFsm: SimpleFsm = null;
        let beforeChar = null;

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

            this.alphabet[character] = character;

            if (idx === 0) {
                initialFsm = fsm;
            }
        });

        return initialFsm;
    }

    /**
     * Convert to Deterministic Finite Automata (DFA)
     * @return {Object}
     */
    public toDFA() {
        return new NFAeToDFA(this.toNFAe(), this.alphabet).convert();
    }

    resolve(stack, input): any {
        return true;
    }
}
