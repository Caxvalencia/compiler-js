import { Operators } from '../constants/operators';
import { ISimpleFSM } from '../interfaces/simple-fsm';
import { State, Transition } from '../state';
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
            KleeneFNAe.searchEnds(
                fsm.init.getTransitions(),
                fsm.end,
                kleene.end
            )
        );

        fsm.init.setTransitions({
            [Operators.EPSILON]: [kleene.init, fsm.end]
        });
        fsm.end.setTransitions({ [Operators.EPSILON]: [kleene.init] });

        return fsm;
    }

    static searchEnds(
        transitions: Transition,
        endState,
        nextState: State
    ): Transition {
        for (let key in transitions) {
            if (transitions[key].indexOf(endState) === -1) {
                transitions[key].forEach((state: State) => {
                    KleeneFNAe.searchEnds(
                        state.getTransitions(),
                        endState,
                        nextState
                    );
                });

                continue;
            }

            transitions[key] = [nextState];
        }

        return transitions;
    }
}
