import { Operators } from '../constants/operators';
import { IFsm } from '../interfaces/fsm';
import { State } from '../state';
import { SimpleFsm } from './simple-fsm';

export class KleeneFsm {
    /**
     * @static
     * @param {IFsm} fsm
     * @returns {IFsm}
     */
    static apply(fsm: IFsm): IFsm {
        let kleene = new SimpleFsm();
        kleene.init = new State();
        kleene.end = new State(Operators.EPSILON, [fsm.end], false);

        for (let key in fsm.init.getTransitions()) {
            kleene.init.addTransition(key, [kleene.end]);
        }

        fsm.init.setTransitions({
            [Operators.EPSILON]: [kleene.init, fsm.end]
        });
        fsm.end.setTransitions({ [Operators.EPSILON]: [kleene.init] });

        return fsm;
    }
}
