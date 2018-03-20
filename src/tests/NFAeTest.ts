import { assert } from 'chai';
import { test, suite } from 'mocha-typescript';
import { Operators } from '../finite-state-machine/constants/operators';
import { RegularExpresion } from '../RegularExpresion';
import { NFAe } from '../finite-state-machine/nfae';

@suite('NFAeTest')
export class NFAeTest {
    @test
    public testSimpleNFAe() {
        let nfae = NFAe.convert('A'.split(''));

        assert.deepEqual(nfae.getAlphabet(), ['A']);
        assert.isTrue(nfae.getFsm().process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatNFAe() {
        let nfae = NFAe.convert('AB'.split(''));

        assert.deepEqual(nfae.getAlphabet(), ['A', 'B']);

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

        assert.deepEqual(nfae.getAlphabet(), ['A']);

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

        assert.deepEqual(nfae.getAlphabet(), ['A', 'B']);

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
    public testUnionKleeneNFAe() {
        let source = 'A*B*';
        let nfae = NFAe.convert(source.split(''));

        assert.deepEqual(nfae.getAlphabet(), ['A', 'B']);

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
