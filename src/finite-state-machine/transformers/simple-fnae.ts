import { ISimpleFSM } from '../interfaces/simple-fsm';
import { State } from '../state';

export class SimpleFNAe implements ISimpleFSM {
    init: State;
    end: State;

    constructor(transition?) {
        this.end = new State(null, null, true);
        this.init = new State(transition, [this.end]);
    }
}
