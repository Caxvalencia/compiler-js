import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Operators } from '../finite-state-machine/constants/operators';
import { NFAe } from '../finite-state-machine/nfae';

@suite()
export class NFAeTest {
    @test
    public testGetAlphabet() {
        let nfaeSimple = NFAe.convert('A');
        let nfaeConcat = NFAe.convert('AB');
        let nfaeKleene = NFAe.convert('A*');
        let nfaeUnion = NFAe.convert('A|B');
        let nfaeConcatKleene = NFAe.convert('A*B*');

        assert.deepEqual(nfaeSimple.getAlphabet(), ['A']);
        assert.deepEqual(nfaeConcat.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeKleene.getAlphabet(), ['A']);
        assert.deepEqual(nfaeUnion.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeConcatKleene.getAlphabet(), ['A', 'B']);
    }

    @test
    public testSimpleNFAe() {
        let nfae = NFAe.convert('A');

        assert.isTrue(nfae.getFsm().process('A')[0].isAccepted, 'A founded');
        assert.isFalse(
            nfae.getFsm().process('B').length > 0,
            'Nothing founded'
        );
    }

    @test
    public testConcatNFAe() {
        let nfae = NFAe.convert('AB');

        assert.isTrue(
            nfae
                .getFsm()
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );

        assert.isFalse(
            nfae
                .getFsm()
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('A').length > 0,
            'AB founded'
        );
    }

    @test
    public testKleeneNFAe() {
        let nfae = NFAe.convert('A*');

        assert.isTrue(
            nfae.getFsm().process(Operators.EPSILON)[1].isAccepted,
            'A* - O ocurrences founded'
        );

        assert.isTrue(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            "A* - Many 'A' ocurrences founded"
        );

        assert.isFalse(
            nfae.getFsm().process('B').length > 0,
            'A* - O ocurrences founded'
        );
    }

    @test
    public testUnionNFAe() {
        let source = 'A|B';
        let nfae = NFAe.convert(source);

        assert.isTrue(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[0]
                .process('A')[0].isAccepted,
            source + ' - A ocurrence founded'
        );

        assert.isTrue(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[1]
                .process('B')[0].isAccepted,
            source + ' - B ocurrence founded'
        );

        assert.isFalse(
            nfae
                .getFsm()
                .process(Operators.EPSILON)[1]
                .process('C').length > 0,
            source + ' - Nothing ocurrence founded'
        );
    }

    @test
    public testPlusNFAe() {
        let source = 'A+';
        let nfae = NFAe.convert(source);
        let fsm = nfae.getFsm();

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
    public testConcatPlusNFAe() {
        let source = 'A+B+';
        let nfae = NFAe.convert(source);

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
}
