export class Lex {
  lexicon: any;
  symbolTable: any[];
  tokens: any[];
  inSymbolTable: any[];
  counterLines: any[];

  regExp: RegExp;

  /**
   * Creates an instance of Lex.
   * @param {any} lexicon
   * @param {any} config
   */
  constructor(lexicon: any = {}, config?: any) {
    this.lexicon = lexicon;
    this.symbolTable = [];
    this.tokens = [];
    this.inSymbolTable = [];
    this.counterLines = [];

    if (config) {
      this.inSymbolTable = config.addSymbolTable || [];
      this.counterLines = config.counterLines || [];
    }

    this.concatLexicon();
  }

  /**
   * @param {string} source
   */
  analyze(source: string) {
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
   * @param {string} tokenName
   * @param {string} rule
   * @returns {this}
   */
  addTokenRule(tokenName: string, rule: string): this {
    this.lexicon[tokenName] = rule;

    return this;
  }

  private concatLexicon() {
    let expr = [];

    for (let tokenName in this.lexicon) {
      expr.push(this.lexicon[tokenName].source);
    }

    this.regExp = new RegExp(
      '(' + expr.join(')|(') + ')|([^' + expr.join(']|[^') + '])',
      'g'
    );
  }

  /**
   * @private
   * @param {string} codeSource
   * @returns
   */
  private getTokenId(codeSource: string) {
    for (let tokenName in this.lexicon) {
      if (!this.lexicon[tokenName].test(codeSource)) {
        continue;
      }

      return tokenName;
    }

    return false;
  }

  /**
   * @private
   * @param {any} tokenName
   * @returns {boolean}
   */
  private canAddSymbolTable(tokenName) {
    return this.inSymbolTable.indexOf(tokenName) !== -1;
  }

  /**
   * @returns {*}
   */
  getTokenRules(): any {
    return this.lexicon;
  }
}
