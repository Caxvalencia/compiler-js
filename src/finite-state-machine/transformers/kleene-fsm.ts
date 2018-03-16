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
        kleene.init = new State();
        kleene.end = new State(Operators.EPSILON, [fsm.end], false);

        const fsmInitTransitions = fsm.init.getTransitions();

        for (let key in fsmInitTransitions) {
            kleene.init.addTransition(key, [kleene.end]);

            let nextStates = fsm.init.getTransition(key).unshift(kleene.init);

            fsm.init.setTransitions({
                [Operators.EPSILON]: fsm.init.getTransition(key)
            });
        }

        fsm.end.setTransitions({ [Operators.EPSILON]: [kleene.init] });

        return fsm;
    }
}
