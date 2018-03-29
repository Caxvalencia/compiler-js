import { Operators } from '../constants/operators';
import { IFsm } from '../interfaces/fsm';
import { State } from '../state';
import { SimpleFNAe } from './simple-fnae';

export class UnionFNAe {
    static fsmFirst: IFsm;
    static fsmSecond: IFsm;
    
    /**
     * @param fsmFirst
     * @param fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond?: IFsm) {
        UnionFNAe.fsmFirst = fsmFirst;
        UnionFNAe.fsmSecond = fsmSecond;

        let union = new SimpleFNAe();
        union.end = null;
        union.init = new State(Operators.EPSILON, [
            fsmFirst.init,
            fsmSecond.init
        ]);

        return union;
    }
}
