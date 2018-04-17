export type Transition = { [key: string]: Array<State> };

export class State {
    id: number | string;
    isAccepted: boolean;

    private transitions: Transition;

    /**
     * Creates an instance of State.
     * @param {string} [transition=null]
     * @param {Array<State>} [nextStates=[]]
     * @param {boolean} [isAccepted=false]
     */
    constructor(
        transition: string = null,
        nextStates: Array<State> = [],
        isAccepted: boolean = false
    ) {
        this.isAccepted = isAccepted;
        this.transitions = {};

        if (transition !== null) {
            this.addTransition(transition, nextStates);
        }
    }

    /**
     * @param {string} [input]
     * @returns {Array<State>}
     */
    process(input?: string): Array<State> {
        return this.transitions[input] || [];
    }

    /**
     * @param {string} symbol
     * @returns {boolean}
     */
    hasTransition(symbol: string): boolean {
        return this.transitions[symbol] !== undefined;
    }

    /**
     * @param {string} transition
     * @param {State[]} nextStates
     * @returns
     */
    addTransition(transition: string, nextStates: State[]) {
        this.transitions[transition] = nextStates;

        return this;
    }

    /**
     * @param {string} transitionId
     * @returns {State[]}
     */
    getTransition(transitionId: string): State[] {
        return this.transitions[transitionId] || [];
    }

    /**
     * @param {Transition} transitions 
     * @returns {this} 
     */
    setTransitions(transitions: Transition): this {
        this.transitions = transitions;

        return this;
    }

    /**
     * @returns {Transition} 
     */
    getTransitions(): Transition {
        return this.transitions;
    }
}
