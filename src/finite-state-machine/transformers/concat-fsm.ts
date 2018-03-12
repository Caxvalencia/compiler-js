import { IFsm } from '../interfaces/fsm';
import { Operators } from '../constants/operators';

export class ConcatFsm {
    /**
     * @param {IFsm} fsmFirst
     * @param {IFsm} fsmSecond
     */
    static apply(fsmFirst: IFsm, fsmSecond: IFsm) {
        fsmFirst.end.transition = Operators.EPSILON;
        fsmFirst.end.isAccepted = false;
        fsmFirst.end.nextStates.push(fsmSecond.init);

        return fsmSecond;
    }
}
