import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';
import { RegularExpresion } from '../RegularExpresion';
import { Operators } from '../finite-state-machine/constants/operators';
import { MapDFA } from '../finite-state-machine/transformers/map-dfa';

declare var console;

@suite('RegularExpresionTest')
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
    public testDFAtoMapping() {
        let regExp = new RegularExpresion('A*');
        let dfaMapped = MapDFA.apply(regExp.toDFA());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [0, 1], regExp.source);

        // =============================================================

        regExp = new RegularExpresion('A|B');
        dfaMapped = MapDFA.apply(regExp.toDFA());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '0-B': 2 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [1, 2], regExp.source);

        // =============================================================

        regExp = new RegularExpresion('A*|B*');
        dfaMapped = MapDFA.apply(regExp.toDFA());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1, '0-B': 2, '2-B': 2 }),
            regExp.source
        );

        assert.sameMembers(dfaMapped.accepts, [0, 1, 2], regExp.source);

        // =============================================================

        // regExp = new RegularExpresion('cc*|b*b|ax*');
        regExp = new RegularExpresion('A|B|C');
        dfaMapped = MapDFA.apply(regExp.toDFA());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '0-B': 2, '0-C': 3 }),
            regExp.source
        );

        assert.sameMembers(dfaMapped.accepts, [1, 2, 3], regExp.source);

        // regExp = new RegularExpresion('(a|b)*');
        // dfaMapped = MapDFA.apply(regExp.toDFA());

        // console.log(dfaMapped);
    }
}
