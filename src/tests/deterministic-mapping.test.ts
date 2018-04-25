import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { DeterministicMapping } from '../finite-state-machine/transformers/deterministic-mapping';
import { RegularExpresion } from '../regular-expresion';

@suite
export class DeterministicMappingTest {
    @test
    public testSimple() {
        let regExp = new RegularExpresion('A');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [1], regExp.source);
    }

    @test
    public testPlus() {
        let regExp = new RegularExpresion('A+');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [1], regExp.source);
    }

    @test
    public testKleene() {
        let regExp = new RegularExpresion('A*');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [0, 1], regExp.source);
    }

    @test
    public testUnionTwo() {
        let regExp = new RegularExpresion('A|B');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '0-B': 2 }),
            regExp.source
        );

        assert.deepEqual(dfaMapped.accepts, [1, 2], regExp.source);
    }

    @test
    public testUnionThree() {
        let regExp = new RegularExpresion('A|B|C');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '0-B': 2, '0-C': 3 }),
            regExp.source
        );

        assert.sameMembers(dfaMapped.accepts, [1, 2, 3], regExp.source);
    }

    @test
    public testUnionOfKleene() {
        let regExp = new RegularExpresion('A*|B*');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1, '0-B': 2, '2-B': 2 }),
            regExp.source
        );

        assert.sameMembers(dfaMapped.accepts, [0, 1, 2], regExp.source);
    }

    @test
    public testGroupUnionKleene() {
        let regExp = new RegularExpresion('(A|B)*');
        let dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

        assert.equal(
            JSON.stringify(dfaMapped.states),
            JSON.stringify({ '0-A': 1, '1-A': 1, '1-B': 1, '0-B': 1 }),
            regExp.source
        );

        assert.sameMembers(dfaMapped.accepts, [0, 1], regExp.source);
    }
}
