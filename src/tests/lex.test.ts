import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';

import { Lex } from '../lex';

declare let console;

@suite
export class LexTest {
  @test
  public testAnalize() {
    let lexico = {
      // DELIMITERS
      '(': /\(/,
      ')': /\)/,
      '{': /\{/,
      '}': /\}/,
      '[': /\[/,
      ']': /\]/,

      // OPERATORS
      '+': /\+/,
      '-': /\-/,
      '*': /\*/,
      '/': /\//,

      NUMBER: /\-?[0-9]*\.?[0-9]+/
    };

    let lexer = new Lex(lexico, {
      addSymbolTable: ['NUMBER', '+', '*', '(', ')', '-']
    });

    lexer.analyze('12+1-(5*3)');
    let lexema = lexer.symbolTable[0];

    assert.isTrue(lexer.symbolTable.length === 9);
    assert.isTrue(lexer.tokens.length === 9);

    assert.equal(lexema.lex, '12');
    assert.equal(lexema.type, 'NUMBER');
  }

  @test
  public testAddTokenRule() {
    const lexer = new Lex();

    lexer.addTokenRule('SPACE', '\\s+');
    lexer.addTokenRule('COMMENT_ONELINE', '//[^\r\n]*');
    lexer.addTokenRule('COMMENT_MULTILINE', '/[*].*?[*]/');
    lexer.addTokenRule('NUMBER', '\\d*.?\\d+');
    lexer.addTokenRule('DELIMITER', '[(){}[];,]');
    lexer.addTokenRule('OPERATOR', '[.=+-/*%]');
    lexer.addTokenRule('COMPARATOR', '>|<|==|>=|<=|!');

    assert.deepEqual({
      SPACE: '\\s+',
      COMMENT_ONELINE: '//[^\r\n]*',
      COMMENT_MULTILINE: '/[*].*?[*]/',
      NUMBER: '\\d*.?\\d+',
      DELIMITER: '[(){}[];,]',
      OPERATOR: '[.=+-/*%]',
      COMPARATOR: '>|<|==|>=|<=|!'
    }, lexer.getTokenRules());
  }

  @test
  public testAnalize2() {
    const lexico = {
      VAR: /\bvar\b/,
      FUNCTION: /\bfunction\b/,
      IF: /\bif\b/,
      RETURN: /\breturn\b/,

      '=': /=/,
      '(': /\(/,
      ')': /\)/,
      '{': /\{/,
      '}': /\}/,

      '<=': /<=/,
      '>=': />=/,
      '<': /</,
      '>': />/,

      // 'ID_FUNC': /\bfunction\b\s+([\$\_a-zA-Z]\w*)/,
      ID: /\b[\$\__a-zA-Z][\w]*\b/,
      NEW_LINE: /[\n\r]/
    };

    const codeSource = `
            var abc = 123

            function test( $a, _b, c ) {
                if( $a < _b ) return c
                if( $a <= _b ) return c
                if( $a >= _b ) return c
                if( $a > _b ) return @
            }
        `;

    const lexer = new Lex(lexico, {
      addSymbolTable: ['ID'],
      counterLines: ['NEW_LINE']
    });

    lexer.analyze(codeSource);

    console.log(lexer.symbolTable);
    console.log(lexer.tokens);
  }
}
