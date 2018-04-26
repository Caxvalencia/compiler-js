import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { FiniteStateMachine } from '../finite-state-machine/finite-state-machine';
import { DeterministicMapping } from '../finite-state-machine/transformers/deterministic-mapping';
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

        assert.isTrue(fsm.process('aaaaaaab', 1), 'Accepted');
    }

    @test
    public testDeterministicMapping() {
        const regExp = new RegularExpresion('A|B|C');
        const dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());
        const fsm = new FiniteStateMachine(dfaMapped.states, dfaMapped.accepts);

        assert.isTrue(fsm.process('A'));
        assert.equal(1, fsm.column);

        assert.isTrue(fsm.process('B'));
        assert.isTrue(fsm.process('C'));
        assert.isTrue(fsm.process('AD'));
        assert.isFalse(fsm.process('D'));
        assert.isFalse(fsm.process(''));
    }
}
