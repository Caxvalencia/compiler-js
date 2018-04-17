import { SEPARATOR } from './transformers/map-dfa';

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
            return this.accepts.indexOf(stateInitial) !== -1;
        }

        let character = string[0];
        let currentState = this.states[stateInitial + SEPARATOR + character];

        if (currentState === undefined) {
            return false;
        }

        return this.run(string.substr(1), currentState);
    }
}
