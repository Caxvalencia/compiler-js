import { assert } from 'chai';
import { test, suite } from 'mocha-typescript';
import { Operators } from '../finite-state-machine/constants/operators';
import { RegularExpresion } from '../RegularExpresion';
import { NFAe } from '../finite-state-machine/nfae';

@suite()
export class NFAeTest {
    @test
    public testGetAlphabet() {
        let nfaeSimple = NFAe.convert('A'.split(''));
        let nfaeConcat = NFAe.convert('AB'.split(''));
        let nfaeKleene = NFAe.convert('A*'.split(''));
        let nfaeUnion = NFAe.convert('A|B'.split(''));
        let nfaeConcatKleene = NFAe.convert('A*B*'.split(''));

        assert.deepEqual(nfaeSimple.getAlphabet(), ['A']);
        assert.deepEqual(nfaeConcat.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeKleene.getAlphabet(), ['A']);
        assert.deepEqual(nfaeUnion.getAlphabet(), ['A', 'B']);
        assert.deepEqual(nfaeConcatKleene.getAlphabet(), ['A', 'B']);
    }

    @test
    public testSimpleNFAe() {
        let nfae = NFAe.convert('A'.split(''));

        assert.isTrue(nfae.getFsm().process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatNFAe() {
        let nfae = NFAe.convert('AB'.split(''));

        assert.isTrue(
            nfae
                .getFsm()
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );
    }

    @test
    public testKleeneNFAe() {
        let nfae = NFAe.convert('A*'.split(''));

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
    }

    @test
    public testUnionNFAe() {
        let source = 'A|B';
        let nfae = NFAe.convert(source.split(''));

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
    }

    @test
    public testConcatKleeneNFAe() {
        let source = 'A*B*';
        let nfae = NFAe.convert(source.split(''));

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
