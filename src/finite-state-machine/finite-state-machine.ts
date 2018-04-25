import { SEPARATOR } from './transformers/deterministic-mapping';

export class FiniteStateMachine {
    states: any;
    accepts: Array<number>;
    isAccepted: boolean;

    constructor(states, accepts: Array<number>) {
        this.states = states;
        this.accepts = accepts;
    }

    /**
     * @param {string} string
     * @param {number} [stateInitial=0]
     * @returns {boolean}
     */
    run(string: string, stateInitial: number = 0): boolean {
        if (string === '') {
            return this.isAcceptedState(stateInitial);
        }

        let character = string[0];
        let currentState = this.states[stateInitial + SEPARATOR + character];

        if (currentState === undefined) {
            return this.isAcceptedState(stateInitial);
        }

        return this.run(string.substr(1), currentState);
    }

    /**
     * @private
     * @param {number} state 
     * @returns {boolean} 
     */
    private isAcceptedState(state: number): boolean {
        return this.accepts.indexOf(state) !== -1;
    }
}
