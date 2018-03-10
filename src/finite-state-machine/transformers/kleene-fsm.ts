import { IFsm } from '../interfaces/fsm';
import { SimpleFsm } from './simple-fsm';
import { State } from '../state';
import { Operators } from '../constants/operators';

export class KleeneFsm {
    /**
     * @param fsm
     */
    static apply(fsm: IFsm): IFsm {
        let kleene = new SimpleFsm();
        kleene.end = new State(Operators.EPSILON, [fsm.end], false);
        kleene.init = new State(fsm.init.transition, [kleene.end]);

        fsm.init.transition = Operators.EPSILON;
        fsm.init.nextStates.unshift(kleene.init);

        fsm.end.transition = Operators.EPSILON;
        fsm.end.nextStates = [kleene.init];

        return fsm;
    }
}
