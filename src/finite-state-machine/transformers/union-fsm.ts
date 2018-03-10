import { IFsm } from '../interfaces/fsm';
import { SimpleFsm } from './simple-fsm';
import { Operators } from '../constants/operators';
import { State } from '../state';

export class UnionFsm {
    static fsmFirst: IFsm;
    static fsmSecond: IFsm;
    
    /**
     * @param fsmFirst
     * @param fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond?: IFsm) {
        this.fsmFirst = fsmFirst;
        this.fsmSecond = fsmSecond;

        let union = new SimpleFsm();
        union.end = new State(null, null, false);
        union.init = new State(Operators.EPSILON, [
            fsmFirst.init,
            fsmSecond.init
        ]);

        return union;
    }
}
