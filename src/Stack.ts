export class Stack {
    public top: number;
    private _stack: number[];

    /**
     * Constructor
     */
    public constructor() {
        const stateInit = 0;

        this._stack = [stateInit];
        this.top = stateInit;
    }

    public push(stateTarget) {
        this._stack.push(stateTarget);
        this.setTop();
    }

    public goto(stateTarget) {
        this.push(stateTarget);
    }

    public reduce(cant) {
        for (let idx = 0; idx < cant; idx++) {
            this._stack.pop();
        }

        this.setTop();
    }

    public getStack() {
        return this._stack;
    }

    private setTop() {
        const len = this._stack.length - 1;
        this.top = this._stack[len];
    }
}
