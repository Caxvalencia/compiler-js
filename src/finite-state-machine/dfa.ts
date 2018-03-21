import { Operators } from './constants/operators';
import { NFAe } from './nfae';
import { State } from './state';

/**
 * @export
 * @class DFA
 */
export class DFA {
    private alphabet: string[];
    private nfae: State;
    private fsm: State;
    private stack: Object;

    /**
     * Creates an instance of DFA.
     * @param  {State} nfae
     * @param  {string[]} alphabet
     */
    constructor(nfae: NFAe) {
        this.stack = {};
        this.nfae = nfae.getFsm();
        this.alphabet = nfae.getAlphabet();
    }

    /**
     * @static
     * @param {string} expresion
     * @returns {DFA}
     */
    static convert(expresion: string): DFA {
        let nfae = NFAe.convert(expresion);

        return new DFA(nfae).convert();
    }

    /**
     * @returns {DFA}
     */
    convert(): DFA {
        this.indexer()(this.nfae);

        let hasNextStates = false;

        for (const symbol of this.alphabet) {
            let nextStates = this.nfae.process(symbol);

            if (nextStates.length > 0) {
                hasNextStates = true;
                break;
            }
        }

        if (!hasNextStates) {
            this.fsm = this.findNext(this.closureEpsilon(this.nfae));
        }

        this.indexer()(this.fsm);

        return this;
    }

    getAlphabet(): string[] {
        return this.alphabet;
    }

    getFsm(): State {
        return this.fsm;
    }

    /**
     * @private
     * @param  {number} [index=0]
     * @return
     */
    private indexer(index = 0) {
        return function indexer(state: State) {
            if (
                state === null ||
                (state.id !== undefined && typeof state.id === 'number')
            ) {
                return;
            }

            const transitions = state.getTransitions();
            state.id = index++;

            for (let transition in transitions) {
                transitions[transition].forEach(indexer);
            }
        };
    }

    /**
     * Find next states, if finded then it get closures this self
     * @private
     * @param  {State[]} states
     * @return State
     */
    private findNext(states: State[]): State {
        if (states.length === 0) {
            return;
        }

        let newStateId = states
            .map(state => state.id)
            .sort()
            .join(',');

        if (this.stack[newStateId] !== undefined) {
            return this.stack[newStateId];
        }

        let newState = new State();
        newState.id = newStateId;

        this.stack[newStateId] = newState;

        for (const symbol of this.alphabet) {
            if (newState.hasTransition(symbol)) {
                continue;
            }

            let nextStates: State[] = [];

            states.forEach((state: State) => {
                state.process(symbol).forEach(nextState => {
                    let closureNextState = this.closureEpsilon(nextState);

                    nextStates = nextStates.concat(
                        closureNextState.filter(
                            state => nextStates.indexOf(state) === -1
                        )
                    );
                });
            });

            if (nextStates.length > 0) {
                nextStates.sort(
                    (current, next) => <any>current.id - <any>next.id
                );
                newState.addTransition(symbol, [this.findNext(nextStates)]);
            }

            newState.isAccepted = states.some(state => state.isAccepted);
        }

        return newState;
    }

    /**
     * @private
     * @param  {State} state
     * @return Array<State>
     */
    private closureEpsilon(state: State): Array<State> {
        let closures = [state];

        const closureEpsilon = (nextState: State) => {
            if (closures.indexOf(nextState) === -1) {
                closures.push(nextState);
            }

            nextState.process(Operators.EPSILON).forEach(closureEpsilon);
        };

        state.process(Operators.EPSILON).forEach(closureEpsilon);

        return closures;
    }
}
