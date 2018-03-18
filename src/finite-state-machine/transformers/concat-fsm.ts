import { Operators } from '../constants/operators';
import { IFsm } from '../interfaces/fsm';

export class ConcatFsm {
    /**
     * @param {IFsm} fsmFirst
     * @param {IFsm} fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond: IFsm) {
        fsmFirst.end.isAccepted = false;
        
        const endTransition = fsmFirst.end.getTransition(Operators.EPSILON);
        endTransition.push(fsmSecond.init);

        fsmFirst.end.addTransition(Operators.EPSILON, endTransition)

        return fsmSecond;
    }
}
