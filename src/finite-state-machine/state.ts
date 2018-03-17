export type Transition = { [key: string]: Array<State> };

export class State {
    id: number | string;
    isAccepted: boolean;

    private transitions: Transition;

    constructor(
        transition: any = null,
        nextStates: Array<State> = [],
        isAccepted = false
    ) {
        this.isAccepted = isAccepted;
        this.transitions = {};

        if (transition !== null) {
            this.addTransition(transition, nextStates);
        }
    }

    process(input?: string): Array<State> {
        return this.transitions[input] || [];
    }

    hasTransition(symbol: string): boolean {
        return this.transitions[symbol] !== undefined;
    }

    addTransition(transition, nextStates: State[]) {
        this.transitions[transition] = nextStates;

        return this;
    }

    getTransition(transitionId) {
        return this.transitions[transitionId] || [];
    }

    setTransitions(transitions: any): any {
        this.transitions = transitions;

        return this;
    }

    getTransitions(): Transition {
        return this.transitions;
    }
}
