import { expect, assert } from 'chai';
import { suite, test } from 'mocha-typescript';
import { Lex } from '../Lex';

declare var console;

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
    
            'NUMBER': /\-?[0-9]*\.?[0-9]+/
        };
        
        let lexer = new Lex( lexico, {
            'addSymbolTable': [ 'NUMBER', '+', '*', '(', ')', '-' ]
        });

        lexer.analyze('12+1-(5*3)');
        let lexema = lexer.symbolTable[0];

        assert.equal(lexema.lex, '12');
        assert.equal(lexema.type, 'NUMBER');
    }
}