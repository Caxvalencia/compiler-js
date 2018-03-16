import { IFsm } from './interfaces/fsm';
import { State } from './state';
import { Operators } from './constants/operators';

export class NFAeToDFA {
    private alphabet: string[];
    private nfae: State;
    private stack: Object;

    constructor(nfae: State, alphabet) {
        this.stack = {};
        this.nfae = nfae;
        this.alphabet = alphabet;
    }

    convert() {
        let stateInitial = this.nfae;
        let fsm: State;

        let indexer = (index = 0) => {
            return (state: State) => {
                if (state.id !== undefined) {
                    return;
                }

                const transitions = state.getTransitions();
                state.id = index;

                for (let transition in transitions) {
                    transitions[transition].forEach(indexer(index + 1));
                }
            };
        };

        indexer()(stateInitial);

        let hasNextStates = false;

        for (const symbol in this.alphabet) {
            let nextStates = stateInitial.process(symbol);

            if (nextStates.length > 0) {
                hasNextStates = true;
            }
        }

        if (!hasNextStates) {
            fsm = this.findNext(this.closureEpsilon(stateInitial));
        }

        return fsm;
    }

    /**
     * Find next states, if finded then it get closures this self
     * @param symbol
     */
    private findNext(states: State[]): State {
        if (states.length === 0) {
            return null;
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

        for (const symbol in this.alphabet) {
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

            nextStates.sort((current, next) => <any>current.id - <any>next.id);
            newState.addTransition(symbol, [this.findNext(nextStates)]);
            newState.isAccepted = states.some(state => state.isAccepted);
        }

        return newState;
    }

    /**
     * @param state
     */
    private closureEpsilon(state): Array<State> {
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
