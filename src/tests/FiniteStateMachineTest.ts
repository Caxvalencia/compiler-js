import { expect } from 'chai';
import { suite, test } from 'mocha-typescript';
import { FiniteStateMachine } from '../FiniteStateMachine';

declare var console;

@suite('FiniteStateMachineTest')
export class FiniteStateMachineTest {
    @test
    public testIsOk() {
        let states = {
            '1 a': 2,
            '2 a': 2,
            '2 b': 3
        };

        let fsm = new FiniteStateMachine('aaaaaaab', 1, states, [3]);
        // console.log( fsm );

        expect(fsm.isAccepted, 'Accepted');
    }
}
