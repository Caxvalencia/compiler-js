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
     * @param {number} [currentState=0] 
     * @returns {boolean}
     */
    run(string: string, currentState: number = 0) {
        if (string === '') {
            return this.accepts.indexOf(currentState) !== -1;
        }

        let character = string[0];
        let state = this.states[currentState + SEPARATOR + character];

        if (state === undefined) {
            return false;
        }

        return this.run(string.substr(1), state);
    }
}
