import { Operators } from '../constants/operators';
import { Helpers } from '../helpers';
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
    static apply(
        fsmFirst: ISimpleFSM,
        fsmSecond?: ISimpleFSM,
        isGroup = false
    ) {
        UnionFNAe.fsmFirst = fsmFirst;
        UnionFNAe.fsmSecond = fsmSecond;

        let union = new SimpleFNAe();

        union.init = new State(Operators.EPSILON, [
            fsmFirst.init,
            fsmSecond.init
        ]);

        if (isGroup) {
            fsmFirst.init.setTransitions(
                Helpers.replaceEnd(
                    fsmFirst.init.getTransitions(),
                    fsmFirst.end,
                    union.end
                )
            );

            fsmSecond.init.setTransitions(
                Helpers.replaceEnd(
                    fsmSecond.init.getTransitions(),
                    fsmSecond.end,
                    union.end
                )
            );
        }

        return union;
    }
}
