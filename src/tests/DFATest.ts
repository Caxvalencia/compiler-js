import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { DFA } from '../finite-state-machine/dfa';

@suite()
export class DFATest {
    @test
    public testSimpleDFA() {
        let dfa = DFA.convert('A');
        assert.isTrue(dfa.getFsm().process('A')[0].isAccepted, 'A founded');
    }

    @test
    public testConcatNFAe() {
        let dfa = DFA.convert('AB');

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('B')[0].isAccepted,
            'AB founded'
        );
    }

    @test
    public testKleeneNFAe() {
        let dfa = DFA.convert('A*');

        assert.isTrue(dfa.getFsm().isAccepted, 'A* - O ocurrences founded');

        assert.isTrue(
            dfa.getFsm().process('A')[0].isAccepted,
            'A* - 1 ocurrences founded'
        );

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('A')[0]
                .process('A')[0].isAccepted,
            "A* - Many 'A' ocurrences founded"
        );
    }

    @test
    public testUnionNFAe() {
        let source = 'A|B';
        let dfa = DFA.convert(source);

        assert.isTrue(
            dfa.getFsm().process('A')[0].isAccepted,
            source + ' - A ocurrence founded'
        );

        assert.isTrue(
            dfa.getFsm().process('B')[0].isAccepted,
            source + ' - B ocurrence founded'
        );
    }

    @test
    public testConcatKleeneNFAe() {
        let source = 'A*B*';
        let dfa = DFA.convert(source);

        assert.isTrue(
            dfa
                .getFsm()
                .process('A')[0]
                .process('A')[0]
                .process('B')[0]
                .process('B')[0].isAccepted,
            source
        );
    }
}
