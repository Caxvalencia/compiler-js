import { SEPARATOR } from './finite-state-machine/transformers/map-dfa';

export class FiniteStateMachine {
    str: string;
    currentState: number;
    states: any;
    accepts: Array<number>;
    isAccepted: boolean;

    constructor(states, accepts: Array<number>, currentState: number = 0) {
        this.states = states;
        this.accepts = accepts;
        this.currentState = currentState;
    }

    run(string) {
        if (string === '') {
            return this.accepts.indexOf(this.currentState) !== -1;
        }

        let character = string[0];
        let state = this.states[this.currentState + SEPARATOR + character];

        if (state === undefined) {
            return false;
        }

        this.currentState = state;

        return this.run(string.substr(1));
    }
}
