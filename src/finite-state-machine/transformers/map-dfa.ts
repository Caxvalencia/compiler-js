import { State } from '../state';

export class MapDFA {
    states: { [key: string]: number };
    accepts: number[];

    constructor() {
        this.states = {};
        this.accepts = [];
    }

    /**
     * @param dfa Deterministic Finite Automata
     */
    static apply(dfa: State) {
        return new MapDFA().apply(dfa);
    }

    private apply(dfa: State) {
        let toJson = dfa => {
            if (dfa.isAccepted) {
                this.accepts.push(dfa.id);
            }

            let transitions = dfa.getTransitions();

            for (let key in transitions) {
                if (this.states[dfa.id + '-' + key]) {
                    continue;
                }

                this.states[dfa.id + '-' + key] = transitions[key][0].id;
                toJson(transitions[key][0]);
            }

            return this;
        };

        return toJson(dfa);
    }
}
