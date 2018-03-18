import { Operators } from './constants/operators';
import { State } from './state';
import { ConcatFsm } from './transformers/concat-fsm';
import { KleeneFsm } from './transformers/kleene-fsm';
import { SimpleFsm } from './transformers/simple-fsm';
import { UnionFsm } from './transformers/union-fsm';

/**
 * @export
 * @class NFAe
 */
export class NFAe {
    private alphabet: string[];
    private source: string[];
    private fsm: State;

    /**
     * Creates an instance of NFAe.
     * @param  {string[]} source
     */
    constructor(source: string[]) {
        this.source = source;
    }

    /**
     * @static
     * @param  {string[]} source
     * @return NFAe
     */
    static convert(source: string[]): NFAe {
        return new NFAe(source).convert();
    }

    /**
     * @return this
     */
    convert(): this {
        let initialFsm: SimpleFsm;
        let fsm: SimpleFsm;
        let beforeFsm: SimpleFsm = null;
        let beforeChar = null;
        let alphabet = {};

        this.source.forEach((character, idx) => {
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
        this.fsm = initialFsm.init;

        return this;
    }

    getAlphabet(): string[] {
        return this.alphabet;
    }

    getFsm(): State {
        return this.fsm;
    }
}
