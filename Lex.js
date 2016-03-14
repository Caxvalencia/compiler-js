'use strict';

var Lex = ( function() {
	/**
	 * Constructor
	 */
	function Lex( lexico, config ) {
		this.lexico = lexico;
		this.symbolTable = [];
		this.tokens = [];
		this.inSymbolTable = [];
		this.counterLines = [];

		if( config ) {
			this.inSymbolTable = config.addSymbolTable || [];
			this.counterLines = config.counterLines || [];
		}

		this.concatLexico();
	}

	/**
	 * Public methods
	 */
	Lex.prototype.analyze = function( source ) {
		var tokenName = null,
			lines = 1,
			finder = null;

		while( ( finder = this.regExp.exec( source ) ) !== null && finder[ 0 ] !== null ) {
			tokenName = this.getTokenID( finder[ 0 ] );

			if( tokenName === 'NEW_LINE' ) {
				lines++;
				continue;
			}

			if( this.canAddSymbolTable( tokenName ) ) {
				let idxSymbol = this.symbolTable.push({
					'lex': finder[ 0 ],
					'scope': 'global',
					'line': lines,
					'type': '',
					'column': finder.index,
					'length': this.regExp.lastIndex,
				}) - 1;

				this.tokens.push([ tokenName, idxSymbol ]);
				continue;
			}
		
			this.tokens.push([ tokenName, finder[ 0 ] ]);
		}
	};

	/**
	 * Private methods
	 */
	Lex.prototype.concatLexico = function() {
		var expr = [];

		for( let tokenName in this.lexico ) {
			expr.push( this.lexico[ tokenName ].source );
		}

		this.regExp = new RegExp( '(' + expr.join( ')|(' ) + ')', 'g' );
	};

	Lex.prototype.getTokenID = function( codeSource ) {
		for( let tokenName in this.lexico ) {
			if( !this.lexico[ tokenName ].test( codeSource ) ) continue;
			return tokenName;
		}

		return false;
	}

	Lex.prototype.canAddSymbolTable = function( tokenName ) {
	 	return this.inSymbolTable.indexOf( tokenName ) !== -1;
	};

	return Lex;
})();