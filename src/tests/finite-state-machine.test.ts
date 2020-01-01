import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { FiniteStateMachine } from '../finite-state-machine/finite-state-machine';
import { DeterministicMapping } from '../finite-state-machine/transformers/deterministic-mapping';
import { RegularExpresion } from '../regular-expresion';

@suite
export class FiniteStateMachineTest {
  @test
  public testSimpleWithStateDefined() {
    const states = {
      '1-a': 2,
      '2-a': 2,
      '2-b': 3
    };

    const fsm = new FiniteStateMachine(states, [3]);

    assert.isTrue(fsm.process('aaaaaaab', 1), 'Accepted');
  }

  @test
  public testDeterministicMapping() {
    const fsm = this.getFSM('A|B|C');

    assert.isTrue(fsm.process('A'));
    assert.isTrue(fsm.process('B'));
    assert.isTrue(fsm.process('C'));
    assert.isTrue(fsm.process('AD'));
    assert.isFalse(fsm.process('D'));
    assert.isFalse(fsm.process(''));
  }

  @test
  public testStartAndEnd() {
    let fsm = this.getFSM('A|B|C|D*');

    fsm.process('A');
    assert.equal(0, fsm.start());
    assert.equal(1, fsm.end());

    fsm.process('B');
    assert.equal(0, fsm.start());
    assert.equal(1, fsm.end());

    fsm.process('C');
    assert.equal(0, fsm.start());
    assert.equal(1, fsm.end());

    fsm.process('AD');
    assert.equal(0, fsm.start());
    assert.equal(1, fsm.end());

    fsm.process('E');
    assert.equal(null, fsm.start());
    assert.equal(0, fsm.end());

    fsm.process('');
    assert.equal(null, fsm.start());
    assert.equal(0, fsm.end());

    fsm.process('DDDDB');
    assert.equal(0, fsm.start());
    assert.equal(4, fsm.end());

    fsm.process('EEDDDDB');
    assert.equal(2, fsm.start());
    assert.equal(6, fsm.end());
  }

  /**
   * @private
   * @param {string} pattern
   * @returns
   */
  private getFSM(pattern: string) {
    const regExp = new RegularExpresion(pattern);
    const dfaMapped = DeterministicMapping.apply(regExp.toDeterministic());

    return new FiniteStateMachine(dfaMapped.states, dfaMapped.accepts);
  }
}
