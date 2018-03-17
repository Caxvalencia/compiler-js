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

        for (let key in fsm.init.getTransitions()) {
            kleene.init.addTransition(key, [kleene.end]);

            fsm.init.getTransition(key).unshift(kleene.init);

            let nextStates = fsm.init.getTransition(key);
            let epsilonStates = fsm.init.getTransition(Operators.EPSILON);

            nextStates = nextStates.filter(
                state => epsilonStates.indexOf(state) === -1
            );

            fsm.init.setTransitions({
                [Operators.EPSILON]: epsilonStates.concat(nextStates)
            });
        }

        fsm.end.setTransitions({ [Operators.EPSILON]: [kleene.init] });

        return fsm;
    }
}
