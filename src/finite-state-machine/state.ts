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

        this.transitions = { [transition]: this.nextStates };
    }

    process(input?: string): Array<State> {
        return input === this.transition ? this.nextStates : [];
    }
}
