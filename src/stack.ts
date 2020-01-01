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

  /**
   * @param stateTarget
   */
  public push(stateTarget: number) {
    this._stack.push(stateTarget);
    this.setTop();
  }

  /**
   * @param {number} stateTarget
   */
  public goto(stateTarget: number) {
    this.push(stateTarget);
  }

  /**
   * @param {number} cant
   */
  public reduce(cant: number) {
    for (let idx = 0; idx < cant; idx++) {
      this._stack.pop();
    }

    this.setTop();
  }

  /**
   * @returns {number[]}
   */
  public getStack(): number[] {
    return this._stack;
  }

  /**
   * @private
   */
  private setTop() {
    this.top = this._stack[this._stack.length - 1];
  }
}
