import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Deterministic } from '../finite-state-machine/deterministic';

@suite()
export class DeterministicTest {
    @test
    public testSimpleDeterministic() {
        let dfa = Deterministic.convert('A').getFsm();

        assert.isTrue(dfa.process('A')[0].isAccepted, 'A founded');
        assert.isFalse(dfa.process('B').length > 0, 'Nothing founded');
    }

    @test
    public testConcatDeterministic() {
        let dfa = Deterministic.convert('AB').getFsm();

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
    public testKleeneDeterministic() {
        let dfa = Deterministic.convert('A*').getFsm();

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
    public testConcatKleeneDeterministic() {
        let source = 'A*B*';
        let dfa = Deterministic.convert(source).getFsm();

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
    public testUnionKleeneDeterministic() {
        let source = 'A*|B*';
        let dfa = Deterministic.convert(source).getFsm();

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
    public testUnionDeterministic() {
        let source = 'A|B';
        let dfa = Deterministic.convert(source).getFsm();

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
    public testPlusDeterministic() {
        let source = 'A+';
        let dfa = Deterministic.convert(source);
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
    public testConcatPlusDeterministic() {
        let source = 'A+B+';
        let dfa = Deterministic.convert(source).getFsm();

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
    public testUnionPlusDeterministic() {
        let source = 'A+|B+';
        let dfa = Deterministic.convert(source).getFsm();

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

    @test
    public testGroupKleene() {
        let source = '(AB)*';
        let dfa = Deterministic.convert(source).getFsm();

        assert.isTrue(dfa.isAccepted, source + ' - O ocurrences founded');

        assert.isTrue(
            dfa.process('A')[0].process('B')[0].isAccepted,
            source + ' - 1 ocurrences founded'
        );

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('B')[0]
                .process('A')[0]
                .process('B')[0].isAccepted,
            source + ' - Many "A" ocurrences founded'
        );
    }

    @test
    public testGroupUnionKleene() {
        let source = '(A|B)*';
        let dfa = Deterministic.convert(source).getFsm();

        assert.isTrue(dfa.isAccepted, source + ' - O ocurrences founded');

        assert.isTrue(
            dfa.process('A')[0].process('B')[0].isAccepted,
            source + ' - 1 ocurrences founded'
        );

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('B')[0]
                .process('B')[0]
                .process('B')[0]
                .process('A')[0]
                .process('B')[0].isAccepted,
            source + ' - Many ocurrences founded'
        );
    }
}
