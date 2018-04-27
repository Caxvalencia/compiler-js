import { SEPARATOR } from './transformers/deterministic-mapping';

export class FiniteStateMachine {
    states: any;
    accepts: Array<number>;
    isAccepted: boolean;

    private indexStart: number;
    private indexEnd: number;

    constructor(states, accepts: Array<number>) {
        this.states = states;
        this.accepts = accepts;
        this.indexEnd = 0;
    }

    /**
     * @param {string} input
     * @param {number} [stateInitial=0]
     * @returns {boolean}
     */
    process(input: string, stateInitial: number = 0): boolean {
        this.indexEnd = 0;

        return this.run(input, stateInitial);
    }

    /**
     * @param {string} input
     * @param {number} [stateInitial=0]
     * @returns {boolean}
     */
    private run(input: string, stateInitial: number = 0): boolean {
        if (input === '') {
            return this.isAcceptedState(stateInitial);
        }

        const character = input[0];
        const currentState = this.states[stateInitial + SEPARATOR + character];

        if (currentState === undefined) {
            return this.isAcceptedState(stateInitial);
        }

        this.indexEnd++;

        return this.run(input.substr(1), currentState);
    }

    /**
     * @private
     * @param {number} state
     * @returns {boolean}
     */
    private isAcceptedState(state: number): boolean {
        return this.accepts.indexOf(state) !== -1;
    }

    public start() {
        return this.indexStart;
    }

    public end() {
        return this.indexEnd;
    }
}
