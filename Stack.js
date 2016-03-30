/**
 * Class Stack
 *
 */
var Stack = ( function() {
	'use strict';

	/**
	 * Constructor
	 */
	function Stack() {
		var stateInit = 0;

		this._stack = [ stateInit ];
		this.top = stateInit;
		this.parsingTable = {};
	}

	/**
	 * Private methods
	 */
	Stack.prototype.setTop = function() {
		var len = this._stack.length - 1;
		this.top = this._stack[ len ];
	};

	/**
	 * Public methods
	 */
	Stack.prototype.goto = function( stateTarget ) {
		this._stack.push( stateTarget );
		this.setTop();

		return this.push( '$' );
	};

	Stack.prototype.reduce = function( cant, ruleReduced, funcBack ) {
		for( let idx = 0; idx < cant; idx++ ) {
			this._stack.pop();
		}

		this.setTop();
		return this.push( ruleReduced );
	};

	Stack.prototype.push = function( token ) {
		var nextState = this.parsingTable[ this.top ][ token ];

		if( nextState === undefined ) {
			if( token === '$' ) return false;
			else throw( "SyntaxError: Unexpected token: " + token );
		}

		switch( nextState[ 0 ] ) {
			// Is accept
			case 'A': return true;

			// Is reduce
			case 'R':
				return this.reduce( nextState[ 1 ], nextState[ 2 ] );

			// Is goto
			case 'G':
				return this.goto( parseInt( nextState[ 1 ] ) );

			// Is push
			default:
				this._stack.push( nextState[ 0 ] );
				this.setTop();
		}

		return false;
	};

	Stack.prototype.setParsingTable = function( parsingTable ) {
		this.parsingTable = parsingTable;
	};

	return Stack;
})();