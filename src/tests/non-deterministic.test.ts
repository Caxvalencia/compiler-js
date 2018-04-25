import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Operators } from '../finite-state-machine/constants/operators';
import { NonDeterministic } from '../finite-state-machine/non-deterministic';

@suite()
export class NonDeterministicTest {
    @test
    public testGetAlphabet() {
        const nfaeSimple = NonDeterministic.convert('A');
        const nfaeConcat = NonDeterministic.convert('AB');
        const nfaeKleene = NonDeterministic.convert('A*');
        const nfaeUnion = NonDeterministic.convert('A|B');
        const nfaeConcatKleene = NonDeterministic.convert('A*B*');
        const nfaeGroupKleene = NonDeterministic.convert('(AB)*');

        assert.deepEqual(nfaeSimple.getAlphabet(), ['A']);
        assert.deepEqual(nfaeConcat.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeKleene.getAlphabet(), ['A']);
        assert.deepEqual(nfaeUnion.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeConcatKleene.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeGroupKleene.getAlphabet(), ['A', 'B']);
    }

    @test
    public testSimpleNonDeterministic() {
        const nfae = NonDeterministic.convert('A').getFsm();

        assert.isTrue(nfae.process('A')[0].isAccepted, 'A founded');
        assert.isFalse(nfae.process('B').length > 0, 'Nothing founded');
    }

    @test
    public testConcatNonDeterministic() {
        const nfae = NonDeterministic.convert('AB').getFsm();

        assert.isTrue(
            nfae
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );

        assert.isFalse(
            nfae
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('A').length > 0,
            'AA founded'
        );
    }

    @test
    public testKleeneNonDeterministic() {
        const nfae = NonDeterministic.convert('A*').getFsm();

        assert.isTrue(
            nfae.process(Operators.EPSILON)[1].isAccepted,
            'A* - O ocurrences founded'
        );

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            "A* - Many 'A' ocurrences founded"
        );

        assert.isFalse(
            nfae.process('B').length > 0,
            'A* - O ocurrences founded'
        );
    }

    @test
    public testConcatKleeneNonDeterministic() {
        const source = 'A*B*';
        const nfae = NonDeterministic.convert(source);

        assert.isTrue(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[1]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source
        );
    }

    @test
    public testUnionNonDeterministic() {
        const source = 'A|B';
        const nfae = NonDeterministic.convert(source).getFsm();

        assert.isTrue(
            nfae
                
                .process(Operators.EPSILON)[0]
                .process('A')[0].isAccepted,
            source + ' - A ocurrence founded'
        );

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[1]
                .process('B')[0].isAccepted,
            source + ' - B ocurrence founded'
        );

        assert.isFalse(
            nfae
                .process(Operators.EPSILON)[1]
                .process('C').length > 0,
            source + ' - Nothing ocurrence founded'
        );
    }

    @test
    public testPlusNonDeterministic() {
        const source = 'A+';
        const nfae = NonDeterministic.convert(source);
        const fsm = nfae.getFsm();

        assert.isFalse(
            fsm.isAccepted,
            'Validate initial state like not accepted'
        );

        assert.equal(
            1,
            fsm.process(Operators.EPSILON).length,
            'Only one next transition for Epsilon input'
        );

        assert.isFalse(
            fsm.process(Operators.EPSILON)[0].isAccepted,
            source + ' - O ocurrences founded'
        );

        assert.isTrue(
            fsm
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source + ' - 1 ocurrences founded'
        );

        assert.isTrue(
            fsm
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source + ' - Many ocurrences founded'
        );
    }

    @test
    public testConcatPlusNonDeterministic() {
        const source = 'A+B+';
        const nfae = NonDeterministic.convert(source).getFsm();

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[1]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source
        );

        assert.isFalse(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[1]
                .process(Operators.EPSILON)[0]
                .process('A').length > 0,
            source
        );
    }

    @test
    public testGroupConcatKleeneNonDeterministic() {
        const source = '(AB)*';
        const nfae = NonDeterministic.convert(source).getFsm();

        assert.isTrue(
            nfae.process(Operators.EPSILON)[1].isAccepted,
            source + ' - O ocurrences founded'
        );

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source + ' - 1 ocurrences founded'
        );

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            source + ' - Many "A" ocurrences founded'
        );
    }

    @test
    public testGroupNonDeterministicThrowErrorSintaxis() {
        assert.throw(() => {
            const source = '(AB';
            NonDeterministic.convert(source).getFsm();
        });
    }
}
