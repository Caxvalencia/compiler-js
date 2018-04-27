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
        this.indexStart = null;
        this.indexEnd = 0;

        return this.run(input.split(''), stateInitial);
    }

    /**
     * @param {string} input
     * @param {number} [stateInitial=0]
     * @returns {boolean}
     */
    private run(input: string[], stateInitial: number = 0): boolean {
        const character = input[this.indexEnd];

        if (input[this.indexEnd] === '') {
            return this.isAcceptedState(stateInitial);
        }

        const currentState = this.states[stateInitial + SEPARATOR + character];

        if (currentState === undefined) {
            return this.isAcceptedState(stateInitial);
        }

        if (this.indexStart === null) {
            this.indexStart = this.indexEnd;
        }

        this.indexEnd++;

        return this.run(input, currentState);
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
