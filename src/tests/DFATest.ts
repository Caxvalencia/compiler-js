import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { DFA } from '../finite-state-machine/dfa';

@suite()
export class DFATest {
    @test
    public testSimpleDFA() {
        let dfa = DFA.convert('A');
        assert.isTrue(dfa.getFsm().process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatDFA() {
        let dfa = DFA.convert('AB');

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );
    }

    @test
    public testKleeneDFA() {
        let dfa = DFA.convert('A*');

        assert.isTrue(dfa.getFsm().isAccepted, 'A* - O ocurrences founded');

        assert.isTrue(
            dfa.getFsm().process('A')[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            "A* - Many 'A' ocurrences founded"
        );
    }

    @test
    public testPlusDFA() {
        let source = 'A+';
        let dfa = DFA.convert(source);
        let fsm = dfa.getFsm();

        assert.isFalse(
            fsm.isAccepted,
            'Validate initial state like not accepted'
        );

        assert.isTrue(
            fsm.process('A')[0].isAccepted,
            source + ' - 1 ocurrences founded'
        );

        assert.isTrue(
            fsm
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            source + ' - Many ocurrences founded'
        );
    }

    @test
    public testUnionDFA() {
        let source = 'A|B';
        let dfa = DFA.convert(source);

        assert.isTrue(
            dfa.getFsm().process('A')[0].isAccepted,
            source + ' - A ocurrence founded'
        );

        assert.isTrue(
            dfa.getFsm().process('B')[0].isAccepted,
            source + ' - B ocurrence founded'
        );
    }

    @test
    public testConcatKleeneDFA() {
        let source = 'A*B*';
        let dfa = DFA.convert(source);

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('A')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );
    }
}
