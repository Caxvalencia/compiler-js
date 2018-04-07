import { Operators } from '../constants/operators';
import { Helpers } from '../helpers';
import { ISimpleFSM } from '../interfaces/simple-fsm';
import { State } from '../state';
import { SimpleFNAe } from './simple-fnae';

export class KleeneFNAe {
    /**
     * @static
     * @param {ISimpleFSM} fsm
     * @returns {ISimpleFSM}
     */
    static apply(fsm: ISimpleFSM): ISimpleFSM {
        let kleene = new SimpleFNAe();
        kleene.init = new State();
        kleene.end = new State(Operators.EPSILON, [fsm.end], false);

        kleene.init.setTransitions(
            Helpers.replaceEnd(fsm.init.getTransitions(), fsm.end, kleene.end)
        );

        fsm.init.setTransitions({
            [Operators.EPSILON]: [kleene.init, fsm.end]
        });
        fsm.end.setTransitions({ [Operators.EPSILON]: [kleene.init] });

        return fsm;
    }
}
