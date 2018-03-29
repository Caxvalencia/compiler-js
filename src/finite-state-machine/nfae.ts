import { Operators } from './constants/operators';
import { IFiniteStateMachine } from './interfaces/finite-state-machine';
import { State } from './state';
import { ConcatFNAe } from './transformers/concat-fnae';
import { KleeneFNAe } from './transformers/kleene-fnae';
import { SimpleFNAe } from './transformers/simple-fnae';
import { UnionFNAe } from './transformers/union-fnae';
import { PlusFNAe } from './transformers/plus-fnae';

/**
 * @export
 * @class NFAe
 */
export class NFAe implements IFiniteStateMachine {
    private alphabet: string[];
    private source: string[];
    private fsm: State;

    /**
     * Creates an instance of NFAe.
     * @param  {string} source
     */
    constructor(source: string) {
        this.source = source.split('');
    }

    /**
     * @static
     * @param {string} source
     * @returns {NFAe}
     */
    static convert(source: string): NFAe {
        return new NFAe(source).convert();
    }

    /**
     * @return this
     */
    convert(): this {
        let initialFsm: SimpleFNAe;
        let fsm: SimpleFNAe;
        let beforeFsm: SimpleFNAe = null;
        let beforeChar = null;
        let alphabet = {};

        this.source.forEach((character, idx) => {
            if (character === Operators.ZERO_OR_MANY) {
                fsm = KleeneFNAe.apply(fsm);
                beforeFsm = fsm;

                return;
            }

            if (character === Operators.ONE_OR_MANY) {
                fsm = PlusFNAe.apply(fsm);
                beforeFsm = fsm;

                return;
            }

            if (character === Operators.OR) {
                beforeChar = character;

                return;
            }

            if (beforeChar === Operators.OR) {
                initialFsm = UnionFNAe.apply(
                    initialFsm,
                    new SimpleFNAe(character)
                );
                fsm = UnionFNAe.fsmSecond;

                beforeChar = character;
                alphabet[character] = character;

                return;
            }

            fsm = new SimpleFNAe(character);

            if (beforeFsm !== null) {
                ConcatFNAe.apply(beforeFsm, fsm);
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
