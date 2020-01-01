import { Operators } from '../constants/operators';
import { ISimpleFSM } from '../interfaces/simple-fsm';

export class ConcatFNAe {
  /**
   * @param {ISimpleFSM} fsmFirst
   * @param {ISimpleFSM} fsmSecond
   */
  static apply(fsmFirst: ISimpleFSM, fsmSecond: ISimpleFSM) {
    fsmFirst.end.isAccepted = false;

    const endTransition = fsmFirst.end.getTransition(Operators.EPSILON);
    endTransition.push(fsmSecond.init);

    fsmFirst.end.addTransition(Operators.EPSILON, endTransition)

    return fsmSecond;
  }
}
