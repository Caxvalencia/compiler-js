import { IFsm } from "../interfaces/fsm";
import { State } from "../state";

export class SimpleFsm implements IFsm {
    init: State;
    end: State;

    constructor(transition?) {
        this.end = new State(null, null, true);
        this.init = new State(transition, [this.end]);
    }
}
