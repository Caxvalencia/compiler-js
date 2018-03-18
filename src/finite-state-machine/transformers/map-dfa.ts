import { State } from '../state';

/**
 * @export
 * @class MapDFA
 */
export class MapDFA {
    states: { [key: string]: number };
    accepts: any[];
    
    /**
     * Creates an instance of MapDFA.
     * @constructor
     */
    constructor() {
        this.states = {};
        this.accepts = [];
    }

    /**
     * @static
     * @param  {State} dfa Deterministic Finite Automata
     * @return {MapDFA}
     */
    static apply(dfa: State) {
        return new MapDFA().apply(dfa);
    }

    /**
     * @private
     * @param  {State} dfa
     * @return {MapDFA}
     */
    private apply(dfa: State) {
        if (dfa.isAccepted && this.accepts.indexOf(dfa.id) === -1) {
            this.accepts.push(dfa.id);
        }

        let transitions = dfa.getTransitions();

        for (let key in transitions) {
            const id: string = dfa.id + '-' + key;

            if (this.states[id]) {
                continue;
            }

            this.states[id] = <number>transitions[key][0].id;
            this.apply(transitions[key][0]);
        }

        return this;
    }
}
