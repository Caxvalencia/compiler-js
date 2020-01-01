import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Operators } from '../finite-state-machine/constants/operators';
import { RegularExpresion } from '../regular-expresion';

@suite()
export class RegularExpresionTest {
  @test
  public testSimpleNFAe() {
    let regExp = new RegularExpresion('A');
    let nfae = regExp.toNonDeterministic();

    assert.isTrue(nfae.process('A')[0].isAccepted, 'A founded');
  }

  @test
  public testConcatNFAe() {
    let regExp = new RegularExpresion('AB');
    let nfae = regExp.toNonDeterministic();

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
    let nfae = regExp.toNonDeterministic();

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
    let nfae = regExp.toNonDeterministic();

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
    let nfae = regExp.toNonDeterministic();

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
    let dfa = regExp.toDeterministic();

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
    let dfa = regExp.toDeterministic();

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
  public testSimpleMatch() {
    let regExp = new RegularExpresion('A*B*');

    let matched = regExp.match('');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === '');
    assert.isNull(matched.start);
    assert.isTrue(matched.end === 0);

    matched = regExp.match('A');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'A');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 1);

    matched = regExp.match('B');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'B');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 1);

    matched = regExp.match('AAAB');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAAB');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 4);

    matched = regExp.match('AAABBBAA');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAABBB');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 6);

    matched = regExp.match('XXAAABBBAA');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAABBB');
    assert.isTrue(matched.start === 2);
    assert.isTrue(matched.end === 8);

    // ===================== WITH PLUS TEST =====================
    regExp = new RegularExpresion('A+B*');

    matched = regExp.match('');
    assert.isFalse(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === '');
    assert.isTrue(matched.start === null);
    assert.isTrue(matched.end === 0);

    matched = regExp.match('A');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'A');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 1);

    matched = regExp.match('B');
    assert.isFalse(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === '');
    assert.isTrue(matched.start === null);
    assert.isTrue(matched.end === 0);

    matched = regExp.match('AAAA');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAAA');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 4);

    matched = regExp.match('AAAAB');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAAAB');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 5);

    matched = regExp.match('AAABBBAA');
    assert.isTrue(matched.isValid, regExp.source);
    assert.isTrue(matched.finded === 'AAABBB');
    assert.isTrue(matched.start === 0);
    assert.isTrue(matched.end === 6);
  }
}
