import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';
import { RegularExpresion } from '../RegularExpresion';
import { Operators } from '../finite-state-machine/constants/operators';

declare var console;

@suite('RegularExpresionTest')
export class RegularExpresionTest {
    @test
    public testSimpleNFAe() {
        let regExp = new RegularExpresion('A');
        let nfae = regExp.toNFAe();

        assert.isTrue(nfae.init.process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatNFAe() {
        let regExp = new RegularExpresion('AB');
        let nfae = regExp.toNFAe();

        assert.isTrue(
            nfae.init
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

        assert.equal(nfae.init.transition, Operators.EPSILON, 'A*');
        assert.equal(nfae.init.nextStates.length, 2, 'A*');

        assert.isTrue(
            nfae.init.process(Operators.EPSILON)[1].isAccepted,
            'A* - O ocurrences founded'
        );

        assert.isTrue(
            nfae.init
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            nfae.init
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
            nfae.init.process(Operators.EPSILON)[0].process('A')[0].isAccepted,
            regExp.source + ' - A ocurrence founded'
        );

        assert.isTrue(
            nfae.init.process(Operators.EPSILON)[1].process('B')[0].isAccepted,
            regExp.source + ' - B ocurrence founded'
        );

        // assert.equal(
        //     JSON.stringify(nfae.states),
        //     JSON.stringify({ '0-c': 1, '1-a': 2, '2-x': 3 }),
        //     'A*'
        // );
        // assert.sameMembers(nfae.accepts, [3], 'A*');
        // ========================================
        // regExp = new RegularExpresion('c|ax*');
        // dfa = regExp.toDFA();
        // assert.equal(
        //     JSON.stringify(dfa.states),
        //     JSON.stringify({ '0-c': 1, '0-a': 2, '2-x': 2 }),
        //     'c|ax*'
        // );
        // assert.sameMembers(dfa.accepts, [1, 2], 'c|ax*');
        // regExp = new RegularExpresion('ca|ax*');
        // dfa = regExp.toDFA();
        // assert.equal(
        //     JSON.stringify(dfa.states),
        //     JSON.stringify({ '0-c': 1, '1-a': 2, '0-a': 3, '3-x': 3 }),
        //     'ca|ax*'
        // );
        // assert.sameMembers(dfa.accepts, [2, 3], 'ca|ax*');
        // let source = 'cc*|b*b|ax*';
        // regExp = new RegularExpresion(source);
        // dfa = regExp.toDFA();
        // assert.equal(
        //     JSON.stringify(dfa.states),
        //     JSON.stringify({ '0-c': 1, '0-a': 2, '2-x': 2 }),
        //     source
        // );
        // assert.sameMembers(dfa.accepts, [1, 2], source);
        // let regExp = new RegularExpresion('(a|b)*');
    }

    @test
    public testUnionKleeneNFAe() {
        let regExp = new RegularExpresion('A*B*');
        let nfae = regExp.toNFAe();

        assert.isTrue(
            nfae.init
                .process(Operators.EPSILON)[0]
                .process('A')[0]
                .process(Operators.EPSILON)[0]
                .process(Operators.EPSILON)[0]
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

        assert.isTrue(
            dfa.process('A')[0].isAccepted,
            regExp.source + ': 0 or n-ocurrences founded'
        );
    }
}
