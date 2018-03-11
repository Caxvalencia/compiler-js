export class State {
    id: number | string;
    nextStates: Array<State>;
    transition: string;
    isAccepted: boolean;

    private transitions: Object;

    constructor(
        transition?: any,
        nextStates?: Array<State>,
        isAccepted = false
    ) {
        this.transition = transition;
        this.nextStates = nextStates || [];
        this.isAccepted = isAccepted;

        this.transitions = {};
    }

    addTransition(transition, nextStates: State[]) {
        this.transitions[transition] = nextStates;

        return this;
    }

    processTransition(input?: string): Array<State> {
        return this.transitions[input] || [];
    }

    process(input?: string): Array<State> {
        return input === this.transition ? this.nextStates : [];
    }

    hasTransition(symbol: string): boolean {
        return this.transitions[symbol] !== undefined;
    }
}
