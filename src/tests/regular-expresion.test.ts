import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Operators } from '../finite-state-machine/constants/operators';
import { RegularExpresion } from '../regular-expresion';

@suite()
export class RegularExpresionTest {
    @test
    public testSimpleNFAe() {
        let regExp = new RegularExpresion('A');
        let nfae = regExp.toNFAe();

        assert.isTrue(nfae.process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatNFAe() {
        let regExp = new RegularExpresion('AB');
        let nfae = regExp.toNFAe();

        assert.isTrue(
            nfae
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );
    }

    @test
    public testKleeneNFAe() {
        let regExp = new RegularExpresion('A*');
        let nfae = regExp.toNFAe();

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
    }

    @test
    public testUnionNFAe() {
        let regExp = new RegularExpresion('A|B');
        let nfae = regExp.toNFAe();

        assert.isTrue(
            nfae.process(Operators.EPSILON)[0].process('A')[0].isAccepted,
            regExp.source + ' - A ocurrence founded'
        );

        assert.isTrue(
            nfae.process(Operators.EPSILON)[1].process('B')[0].isAccepted,
            regExp.source + ' - B ocurrence founded'
        );
    }

    @test
    public testConcatKleeneNFAe() {
        let regExp = new RegularExpresion('A*B*');
        let nfae = regExp.toNFAe();

        assert.isTrue(
            nfae
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[1]
                .process(Operators.EPSILON)[0]
                .process('B')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            regExp.source
        );
    }

    @test
    public testKleeneDFA() {
        let regExp = new RegularExpresion('A*');
        let dfa = regExp.toDFA();

        assert.isTrue(dfa.isAccepted, regExp.source + ': 0 ocurrences founded');

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            regExp.source + ': n-ocurrences founded'
        );

        assert.isUndefined(
            dfa.process('B')[0],
            regExp.source + ': not ocurrences founded'
        );
    }

    @test
    public testConcatKleeneDFA() {
        let regExp = new RegularExpresion('A*B*');
        let dfa = regExp.toDFA();

        assert.isTrue(dfa.isAccepted, regExp.source + ': 0 ocurrences founded');

        assert.isTrue(
            dfa
                .process('A')[0]
                .process('A')[0]
                .process('B')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            regExp.source + ': n-ocurrences founded'
        );
    }

    @test
    public testMatch() {
        let regExp = new RegularExpresion('A*B*');

        assert.isTrue(regExp.match(''), regExp.source);
        assert.isTrue(regExp.match('A'), regExp.source);
        assert.isTrue(regExp.match('B'), regExp.source);
        assert.isTrue(regExp.match('AAAB'), regExp.source);
        assert.isTrue(regExp.match('AAABBBAA'), regExp.source);

        regExp = new RegularExpresion('A+B*');

        assert.isFalse(regExp.match(''), regExp.source);
        assert.isTrue(regExp.match('A'), regExp.source);
        assert.isFalse(regExp.match('B'), regExp.source);
        assert.isTrue(regExp.match('AAAA'), regExp.source);
        assert.isTrue(regExp.match('AAAAB'), regExp.source);
        assert.isTrue(regExp.match('AAAABBBB'), regExp.source);
    }
}
