import { Operators } from './constants/operators';
import { IFiniteStateMachine } from './interfaces/finite-state-machine';
import { State } from './state';
import { ConcatFNAe } from './transformers/concat-fnae';
import { KleeneFNAe } from './transformers/kleene-fnae';
import { PlusFNAe } from './transformers/plus-fnae';
import { SimpleFNAe } from './transformers/simple-fnae';
import { UnionFNAe } from './transformers/union-fnae';

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
     * @returns {this}
     */
    convert(): this {
        this.fsm = this.createFsm(this.source).init;

        return this;
    }

    /**
     * @private
     * @param {string[]} source
     * @returns {SimpleFNAe}
     */
    private createFsm(source: string[]): SimpleFNAe {
        let fsmInit: SimpleFNAe;
        let fsmEnd: SimpleFNAe;
        let beforeFsm: SimpleFNAe = null;
        let beforeChar = null;
        let alphabet = {};

        let iterator = source[Symbol.iterator]();
        let switchFirst = true;
        let character;

        while ((character = iterator.next().value)) {
            if (character === Operators.ZERO_OR_MANY) {
                fsmEnd = KleeneFNAe.apply(fsmEnd);
                beforeFsm = fsmEnd;

                continue;
            }

            if (character === Operators.ONE_OR_MANY) {
                fsmEnd = PlusFNAe.apply(fsmEnd);
                beforeFsm = fsmEnd;

                continue;
            }

            if (character === Operators.OR) {
                beforeChar = character;

                continue;
            }

            if (beforeChar === Operators.OR) {
                fsmInit = UnionFNAe.apply(
                    fsmInit,
                    new SimpleFNAe(character)
                );
                fsmEnd = UnionFNAe.fsmSecond;

                beforeChar = character;
                alphabet[character] = character;

                continue;
            }

            fsmEnd = new SimpleFNAe(character);

            if (beforeFsm !== null) {
                ConcatFNAe.apply(beforeFsm, fsmEnd);
            }

            beforeFsm = fsmEnd;
            beforeChar = character;

            alphabet[character] = character;

            if (switchFirst) {
                fsmInit = fsmEnd;
                switchFirst = false;
            }
        }

        this.alphabet = Object.getOwnPropertyNames(alphabet);

        return fsmInit;
    }

    getAlphabet(): string[] {
        return this.alphabet;
    }

    getFsm(): State {
        return this.fsm;
    }
}
