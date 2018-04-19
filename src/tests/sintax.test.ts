import { assert } from 'chai';
import { suite, test } from 'mocha-typescript';
import { Syntax } from '../syntax';
import { Lex } from '../lex';

@suite
export class SintaxTest {
    @test
    public testAnalize() {
        /**
         * Analizador Lexico
         */
        var lexico = {
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

        var grammar = {
            E: ['E + T', 'E - T', 'T'],

            T: ['T * F', 'T / F', 'F'],

            F: ['NUMBER', '( E )', '{ E }']
        };

        var lexer = new Lex(lexico, {
            addSymbolTable: ['NUMBER', '+', '*', '(', ')', '-']
        });
        var syntax = new Syntax(grammar, lexer);

        lexer.analyze('5 + 5 * (5+5)');

        syntax.setTokens(lexer.tokens);
        syntax.setSymbolTable(lexer.symbolTable);

        assert.isTrue(syntax.analyze());
    }
}
