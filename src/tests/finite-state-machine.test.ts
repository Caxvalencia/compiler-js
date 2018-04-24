import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { FiniteStateMachine } from '../finite-state-machine/finite-state-machine';
import { MapDFA } from '../finite-state-machine/transformers/map-dfa';
import { RegularExpresion } from '../regular-expresion';

@suite
export class FiniteStateMachineTest {
    @test
    public testSimpleWithStateDefined() {
        const states = {
            '1-a': 2,
            '2-a': 2,
            '2-b': 3
        };

        const fsm = new FiniteStateMachine(states, [3]);

        assert.isTrue(fsm.run('aaaaaaab', 1), 'Accepted');
    }

    @test
    public testMappedDFA() {
        const regExp = new RegularExpresion('A|B|C');
        const dfaMapped = MapDFA.apply(regExp.toDFA());

        const fsm = new FiniteStateMachine(dfaMapped.states, dfaMapped.accepts);

        assert.isTrue(fsm.run('A'));
        assert.isTrue(fsm.run('B'));
        assert.isTrue(fsm.run('C'));
        assert.isFalse(fsm.run('D'));
        assert.isFalse(fsm.run(''));
    }
}
