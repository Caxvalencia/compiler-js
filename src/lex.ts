export class Lex {
    lexico: any;
    symbolTable: any[];
    tokens: any[];
    inSymbolTable: any[];
    counterLines: any[];

    regExp: RegExp;

    /**
     * Constructor
     */
    public constructor(lexicon, config) {
        this.lexico = lexicon;
        this.symbolTable = [];
        this.tokens = [];
        this.inSymbolTable = [];
        this.counterLines = [];

        if (config) {
            this.inSymbolTable = config.addSymbolTable || [];
            this.counterLines = config.counterLines || [];
        }

        this.concatLexico();
    }

    /**
     * @param {any} source
     */
    public analyze(source: any) {
        let lines = 1;
        let tokenName = null;
        let finder = null;

        this.tokens = [];
        this.symbolTable = [];

        while (
            (finder = this.regExp.exec(source)) !== null &&
            finder[0] !== null
        ) {
            tokenName = this.getTokenId(finder[0]);

            if (tokenName === 'NEW_LINE') {
                lines++;
                continue;
            }

            if (tokenName === false) {
                break;
            }

            if (this.canAddSymbolTable(tokenName)) {
                let idxSymbol =
                    this.symbolTable.push({
                        lex: finder[0],
                        scope: 'global',
                        line: lines,
                        type: tokenName,
                        column: finder.index,
                        length: this.regExp.lastIndex
                    }) - 1;

                this.tokens.push([tokenName, idxSymbol]);
                continue;
            }

            this.tokens.push([tokenName, finder[0]]);
        }
    }

    /**
     * Private methods
     */
    private concatLexico() {
        let expr = [];

        for (let tokenName in this.lexico) {
            expr.push(this.lexico[tokenName].source);
        }

        this.regExp = new RegExp(
            '(' + expr.join(')|(') + ')|([^' + expr.join(']|[^') + '])',
            'g'
        );
    }

    private getTokenId(codeSource) {
        for (let tokenName in this.lexico) {
            if (!this.lexico[tokenName].test(codeSource)) {
                continue;
            }

            return tokenName;
        }

        return false;
    }

    private canAddSymbolTable(tokenName) {
        return this.inSymbolTable.indexOf(tokenName) !== -1;
    }
}
