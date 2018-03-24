import { Operators } from '../constants/operators';
import { IFsm } from '../interfaces/fsm';
import { State } from '../state';
import { SimpleFsm } from './simple-fsm';

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
        union.end = null;
        union.init = new State(Operators.EPSILON, [
            fsmFirst.init,
            fsmSecond.init
        ]);

        return union;
    }
}
