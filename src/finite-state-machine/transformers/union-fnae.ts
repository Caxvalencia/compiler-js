import { Operators } from '../constants/operators';
import { ISimpleFSM } from '../interfaces/simple-fsm';
import { State, Transition } from '../state';
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
                UnionFNAe.replaceEnd(
                    fsmFirst.init.getTransitions(),
                    fsmFirst.end,
                    union.end
                )
            );

            fsmSecond.init.setTransitions(
                UnionFNAe.replaceEnd(
                    fsmSecond.init.getTransitions(),
                    fsmSecond.end,
                    union.end
                )
            );
        }

        return union;
    }

    static replaceEnd(
        transitions: Transition,
        endState,
        nextState: State
    ): Transition {
        for (let key in transitions) {
            if (transitions[key].indexOf(endState) === -1) {
                transitions[key].forEach((state: State) => {
                    UnionFNAe.replaceEnd(
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
