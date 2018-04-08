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
        this.alphabet = [];
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
        this.fsm = this.createFsm(this.source).fsmInit.init;

        return this;
    }

    /**
     * @private
     * @param {string[]} source
     * @param {boolean} [isGroup=false]
     * @returns {{ fsmEnd: SimpleFNAe; fsmInit: SimpleFNAe }}
     */
    private createFsm(
        source: string[],
        isGroup: boolean = false
    ): { fsmEnd: SimpleFNAe; fsmInit: SimpleFNAe } {
        let fsmInit: SimpleFNAe;
        let fsmEnd: SimpleFNAe;
        let beforeFsm: SimpleFNAe = null;

        let iterator = source[Symbol.iterator]();
        let switchFirst = true;
        let character;

        while ((character = iterator.next().value)) {
            if (character === Operators.PARENTHESIS_OPEN) {
                let finiteStateMachines = this.groupFsm(iterator);
                fsmEnd = finiteStateMachines.fsmEnd;
                fsmEnd.init = finiteStateMachines.fsmInit.init;

                if (switchFirst) {
                    fsmInit = fsmEnd;
                    switchFirst = false;
                }

                continue;
            }

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
                character = iterator.next().value;

                fsmInit = UnionFNAe.apply(
                    fsmInit,
                    new SimpleFNAe(character),
                    isGroup
                );
                fsmEnd = UnionFNAe.fsmSecond;

                if (isGroup) {
                    fsmEnd = fsmInit;
                }

                this.addCharToAlphabet(character);

                continue;
            }

            fsmEnd = new SimpleFNAe(character);

            if (beforeFsm !== null) {
                ConcatFNAe.apply(beforeFsm, fsmEnd);
            }

            beforeFsm = fsmEnd;

            this.addCharToAlphabet(character);

            if (switchFirst) {
                fsmInit = fsmEnd;
                switchFirst = false;
            }
        }

        return {
            fsmInit,
            fsmEnd
        };
    }

    private groupFsm(iteratorChars) {
        let subSource = [];
        let correctlyClosed = false;
        let character;

        while ((character = iteratorChars.next().value)) {
            if (character === Operators.PARENTHESIS_CLOSE) {
                correctlyClosed = true;
                break;
            }

            subSource.push(character);
        }

        if (!correctlyClosed) {
            throw Error("Sintaxis Error: Not closed parenthesis ')'.");
        }

        return this.createFsm(subSource, true);
    }

    private addCharToAlphabet(character: string): void {
        if (this.alphabet.indexOf(character) === -1) {
            this.alphabet.push(character);
        }
    }

    getAlphabet(): string[] {
        return this.alphabet;
    }

    getFsm(): State {
        return this.fsm;
    }
}
