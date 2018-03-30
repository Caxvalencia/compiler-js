import { Operators } from '../constants/operators';
import { ISimpleFSM } from '../interfaces/simple-fsm';
import { State } from '../state';
import { SimpleFNAe } from './simple-fnae';

export class UnionFNAe {
    static fsmFirst: ISimpleFSM;
    static fsmSecond: ISimpleFSM;
    
    /**
     * @param fsmFirst
     * @param fsmSecond
     */
    static apply(fsmFirst: ISimpleFSM, fsmSecond?: ISimpleFSM) {
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
