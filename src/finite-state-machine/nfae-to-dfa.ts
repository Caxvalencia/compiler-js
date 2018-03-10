import { IFsm } from './interfaces/fsm';
import { State } from './state';
import { Operators } from './constants/operators';

export class NFAeToDFA {
    private alphabet: string[];
    private nfae: IFsm;
    private stack: Object;

    constructor(nfae: IFsm, alphabet) {
        this.stack = {};
        this.nfae = nfae;
        this.alphabet = alphabet;
    }

    convert() {
        let stateInitial = this.nfae.init;
        let fsm: State;

        let indexer = (index = 0) => {
            return (state: State) => {
                if (state.id !== undefined) {
                    return;
                }

                state.id = index;
                state.nextStates.forEach(indexer(index + 1));
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
            for (const symbol in this.alphabet) {
                let newState = this.findNext(
                    this.closureEpsilon(stateInitial),
                    symbol
                );

                fsm = newState;
            }
        }

        return fsm;
    }

    /**
     * Find next states, if finded then it get closures this self
     * @param symbol
     */
    private findNext(states: State[], symbol: string): State {
        let nextStates: State[] = [];
        let newStateId: any = [];

        states.forEach((state: State) => {
            newStateId.push(state.id);

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
        newStateId = newStateId.sort().join(',');

        if (this.stack[newStateId] !== undefined) {
            return this.stack[newStateId];
        }

        this.stack[newStateId] = new State(symbol);
        this.stack[newStateId].id = newStateId;
        this.stack[newStateId].isAccepted = nextStates.some(
            state => state.isAccepted
        );
        this.stack[newStateId].nextStates = [this.findNext(nextStates, symbol)];

        return this.stack[newStateId];
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
