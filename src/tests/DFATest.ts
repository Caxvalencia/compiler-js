import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { DFA } from '../finite-state-machine/dfa';

@suite()
export class DFATest {
    @test
    public testSimpleDFA() {
        let dfa = DFA.convert('A').getFsm();

        assert.isTrue(dfa.process('A')[0].isAccepted, 'A founded');
        assert.isFalse(dfa.process('B').length > 0, 'Nothing founded');
    }

    @test
    public testConcatDFA() {
        let dfa = DFA.convert('AB').getFsm();

        assert.isTrue(
            dfa.process('A')[0].process('B')[0].isAccepted,
            'AB founded'
        );

        assert.isFalse(
            dfa.process('A')[0].process('A').length > 0,
            'AB founded'
        );
    }

    @test
    public testKleeneDFA() {
        let dfa = DFA.convert('A*').getFsm();

        assert.isTrue(dfa.isAccepted, 'A* - O ocurrences founded');

        assert.isTrue(
            dfa.process('A')[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            "A* - Many 'A' ocurrences founded"
        );

        assert.isFalse(
            dfa.process('B').length > 0,
            'A* - O ocurrences founded'
        );
    }

    @test
    public testConcatKleeneDFA() {
        let source = 'A*B*';
        let dfa = DFA.convert(source).getFsm();

        assert.isTrue(dfa.isAccepted);

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );
    }

    @test
    public testUnionKleeneDFA() {
        let source = 'A*|B*';
        let dfa = DFA.convert(source).getFsm();

        assert.isTrue(dfa.isAccepted);

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            source
        );

        assert.isTrue(
            dfa
                .process('B')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );
    }

    @test
    public testUnionDFA() {
        let source = 'A|B';
        let dfa = DFA.convert(source).getFsm();

        assert.isTrue(
            dfa.process('A')[0].isAccepted,
            source + ' - A ocurrence founded'
        );

        assert.isTrue(
            dfa.process('B')[0].isAccepted,
            source + ' - B ocurrence founded'
        );

        assert.isFalse(
            dfa.process('C').length > 0,
            source + ' - Nothing ocurrence founded'
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
    public testConcatPlusDFA() {
        let source = 'A+B+';
        let dfa = DFA.convert(source).getFsm();

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );

        assert.isFalse(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            source
        );
    }

    @test
    public testUnionPlusDFA() {
        let source = 'A+|B+';
        let dfa = DFA.convert(source).getFsm();

        assert.isFalse(dfa.isAccepted);

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            source
        );

        assert.isTrue(
            dfa
                .process('B')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );
    }
}
