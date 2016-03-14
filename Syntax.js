/**
 * Class Syntax
 *
 * { rule -> productions[][], ... }
 */
var Syntax = ( function( SymbolTable ) {
	'use strict';
	
	const SYMBOL_EXTEND = "G'";
	const SYMBOL_LOCKED = "$";
	
	/**
	 * Constructor
	 */
	function Syntax( grammar, lex ) {
		this.grammar = grammar;

		this.symbolTable = [];
		this.tokens = [];

		this.configureGrammar();
		this.setLex( lex );
		this.generateParsingTable();
	}

	/**
	 * Public methods
	 */
	Syntax.prototype.analyze = function( source ) {
		// var token = nextToken();

		// while( ( finder = this.regExp.exec( source ) ) !== null && finder[ 0 ] !== null ) {
		// }
	};

	/**
	 * Private methods
	 */
	Syntax.prototype.configureGrammar = function( source ) {
		var grammarExtended = {};

		for( let prod in this.grammar ) {
			if( grammarExtended[ SYMBOL_EXTEND ] === undefined )
				grammarExtended[ SYMBOL_EXTEND ] = [ [ prod, '$' ] ];

			if( !this.grammar.hasOwnProperty( prod ) ) continue;
			grammarExtended[ prod ] = this.grammar[ prod ];

			for( let i = 0; i < this.grammar[ prod ].length; i++ ) {
				grammarExtended[ prod ][ i ] = this.grammar[ prod ][ i ].split( /\s+/ );
			}
		}

		this.grammar = grammarExtended;
	}

	Syntax.prototype.generateParsingTable = function() {
		this.parsingTable = [];
		this.createStateInitial( this.grammar[ SYMBOL_EXTEND ] );
		this.createStates();

		for( let state = 0; state < this.states.length; state++ ) {
			console.log( 'state: ' + state );
			// console.table( this.getState( state ).data );
			console.log( this.getState( state ) );
		}
	};

	Syntax.prototype.createStateInitial = function( initProd ) {
		this.states = [];
		var lock = 0;

		for( let prod = 0; prod < initProd.length; prod++ ) {
			let production = initProd[ prod ];
			
			// if is a NonTerminal
			if( !this.isTerminal( production[ lock ] ) ) {
				let currentState = this.createState( production, lock );
				this.searchProductions( production[ lock ], currentState );
			}
		}
	};

	Syntax.prototype.searchProductions = function( nonTerminal, state ) {
		var productions = this.grammar[ nonTerminal ];

		for( let prod = 0; prod < productions.length; prod++ ) {
			let production = productions[ prod ];
			this.addProductionToState( state, production );

			// if is a NonTerminal, generate productions
			if( production[ 0 ] !== nonTerminal && !this.isTerminal( production[ 0 ] ) ) {
				this.searchProductions( production[ 0 ], state );
			}
		}
	};

	Syntax.prototype.createStates = function() {
		// From state zero, generate all states
		var rule = null,
			ruleData = null,
			currentState = null,
			stateAux = null,
			hasState = null,
			findNextState = null;

		// Calculate total states for prevent loops
		var totalStates = this.terminalActives.length + this.states[ 0 ].data.length - 1;

		for( let state = 0; state < totalStates; state++ ) {
			currentState = this.getState( state );

			for( rule = 0; rule < currentState.data.length; rule++ ) {
				stateAux = state;
				ruleData = currentState.data[ rule ];

				// Validate if state is closed
				if( ruleData.current === undefined || ruleData.current === '$' )
					continue;

				hasState = currentState[ ruleData.current ];

				// Validate if exist the transition/through state A to state B
				if( hasState ) {
					if( !this.existsInState( hasState, ruleData ) ) {
						this.addProductionToState( hasState, ruleData.production, ruleData.lock + 1 );
					}

				} else {
					findNextState = this.searchNextStateByRule( ruleData );

					// Add through via reference
					if( findNextState !== -1 ) {
						currentState[ ruleData.current ] = findNextState;

					} else {
						stateAux = this.createState( ruleData.production, ruleData.lock + 1 )
						currentState[ ruleData.current ] = this.getState( stateAux );
						
						if( !this.isTerminal( ruleData.next ) )
							this.searchProductions( ruleData.next, stateAux );
					}
				}
			}
		}
	};

	Syntax.prototype.searchNextStateByRule = function( rule ) {
		var mainRule = null,
			len = this.states.length;

		// Analyze all states except zero state
		for( let state = 1; state < len; state++ ) {
			mainRule = this.getState( state ).data[ 0 ];
			
			if( mainRule.productionStr !== rule.productionStr ) continue;
			if( mainRule.current !== rule.next ) continue;
			if( mainRule.lock !== ( rule.lock + 1 ) ) continue;

			return this.getState( state );
		}
		
		return -1;
	};

	Syntax.prototype.existsInState = function( state, rule ) {
		var mainRule = null,
			len = state.data.length;

		// Analyze all rules of the state
		for( let ruleIdx = 1; ruleIdx < len; ruleIdx++ ) {
			mainRule = state.data[ ruleIdx ];
			
			if( mainRule.productionStr !== rule.productionStr ) continue;
			if( mainRule.current !== rule.next ) continue;
			if( mainRule.lock !== ( rule.lock + 1 ) ) continue;

			return true;
		}
		
		return false;
	};

	/**
	 * Insertions methods for property state
	 */
	Syntax.prototype.createState = function( production, lock ) {
		var state = { 'index': null, 'data': [] };

		if( production )
			state.data.push( this.createStateData( production, lock ) );

		var index = this.states.push( state ) - 1;
		state.index = index;
		
		return index;
	};

	Syntax.prototype.addProductionToState = function( state, production, lock ) {
		if( typeof state === 'number' )
			state = this.getState( state );
		
		return state.data.push( this.createStateData( production, ( lock || 0 ) ) ) - 1;
	};

	Syntax.prototype.createStateData = function( production, lock ) {
		var current = production[ lock ] === undefined
			? SYMBOL_LOCKED
			: production[ lock ];
		
		var next = production[ lock + 1 ] === undefined && current !== SYMBOL_LOCKED
			? SYMBOL_LOCKED
			: production[ lock + 1 ];

		return {
			'production': production,
			'productionStr': production.join( ' ' ),
			'lock': lock,
			'current': current,
			'next': next
		};
	};


	/**
	 * Setters and getters methods
	 */
	Syntax.prototype.setTokens = function( tokens ) {
		this.tokens = tokens;
		return this;
	};

	Syntax.prototype.setSymbolTable = function( symbolTable ) {
		this.symbolTable = symbolTable;
		return this;
	};

	Syntax.prototype.setLex = function( lex ) {
		this.terminals = [ '$' ];
		this.terminalActives = [ '$' ];

		this.setTokens( lex.tokens );
		this.setSymbolTable( lex.symbolTable );

		var prod = null;

		for( let tokenName in lex.lexico ) {
			this.terminals.push( tokenName );
			
			// Add only terminals used
			for( prod in this.grammar ) {
				for( let i = 0; i < this.grammar[ prod ].length; i++) {
					if( this.grammar[ prod ][ i ].indexOf( tokenName ) === -1 )
						continue
						
					this.terminalActives.push( tokenName );
					break;
				}
			}
		}

		return this;
	};

	Syntax.prototype.isTerminal = function( item ) {
		if( item === undefined ) return true;
		return this.terminals.indexOf( item ) !== -1;
	};

	Syntax.prototype.getState = function( state ) {
		return this.states[ state ];
	};

	return Syntax;
})( {} );