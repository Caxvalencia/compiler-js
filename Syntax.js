/**
 * Class Syntax
 *
 * { rule -> productions[][], ... }
 */
var Syntax = ( function( SymbolTable, Stack ) {
    'use strict';

    const SYMBOL_EXTEND = "_G'";
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
        this.configParsingTable();
    }

    /**
     * Public methods
     */
    Syntax.prototype.analyze = function() {
        this.Stack = new Stack();

        var token = '',
            nextToken = '',
            i,
            isAccept = false,
            errorMessage = '';

        for( i = 0; i < this.tokens.length; i++ ) {
            // [ TOKEN_ID, VALUE ]
            token = this.tokens[ i ];
            nextToken = this.tokens[ i+1 ] || [];
            isAccept = false;
            
            try {
                this.eval( token[ 0 ], nextToken[ 0 ] );
                isAccept = this.eval( SYMBOL_LOCKED, nextToken[ 0 ] );

            } catch( ex ) {
                let data = this.symbolTable[ token[ 1 ] ];
                errorMessage += ex + ' at line(' + data.line + '), column(' + data.column + ')\n';
                break;
            }
        }

        if( !isAccept ) console.warn( errorMessage );
        return isAccept;
    };

    Syntax.prototype.eval = function( token, nextToken ) {
        var nextState = this.parsingTable[ this.Stack.top ][ token ];

        // LOG OF EVAL
        console.log( token + '=>', this.Stack._stack, nextState, 'next: ' + nextToken );

        if( nextState === undefined ) {
            if( token === SYMBOL_LOCKED ) return false;
            else throw( "SyntaxError: Unexpected token: " + token );
        }

        switch( nextState[ 0 ] ) {
            // Is accept
            case 'A':
                return true;

            // Is reduce
            case 'R':
                this.Stack.reduce( nextState[ 1 ] );
                return this.eval( nextState[ 2 ], nextToken );

            // Is goto
            case 'G':
                this.Stack.goto( parseInt( nextState[ 1 ] ) );

                if( this.parsingTable[ this.Stack.top ][ nextToken ] !== undefined )
                    return false;

                return this.eval( SYMBOL_LOCKED, nextToken );

            // Is push
            default:
                this.Stack.push( nextState[ 0 ] );
                return false;
        }
    };

    /**
     * Private methods
     */
    Syntax.prototype.configureGrammar = function( source ) {
        var grammarExtended = {};

        // Extend grammar and convert strings to arrays
        for( let prod in this.grammar ) {
            if( !this.grammar.hasOwnProperty( prod ) ) continue;

            if( grammarExtended[ SYMBOL_EXTEND ] === undefined ) {
                grammarExtended[ SYMBOL_EXTEND ] = [ [ prod, SYMBOL_LOCKED ] ];
                grammarExtended[ SYMBOL_EXTEND ][ 0 ].nonTerminalParent = SYMBOL_EXTEND;
            }

            grammarExtended[ prod ] = this.grammar[ prod ];

            for( let i = 0; i < this.grammar[ prod ].length; i++ ) {
                grammarExtended[ prod ][ i ] = this.grammar[ prod ][ i ].split( /\s+/ );
                grammarExtended[ prod ][ i ].nonTerminalParent = prod;
            }
        }

        this.grammar = grammarExtended;
    }

    Syntax.prototype.configParsingTable = function() {
        this.createStateInitial();
        this.createStates();
        this.createParsingTable();
    };

    Syntax.prototype.createStateInitial = function() {
        this.states = [];
        var lock = 0,
            initProd = this.grammar[ SYMBOL_EXTEND ];

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
            existState = null,
            findNextState = null;

        // Calculate total states for prevent loops
        var totalStates = this.terminalActives.length + this.states[ 0 ].data.length - 1;

        for( let state = 0; state < totalStates; state++ ) {
            currentState = this.getState( state );

            for( rule = 0; rule < currentState.data.length; rule++ ) {
                stateAux = state;
                ruleData = currentState.data[ rule ];

                // Validate if state is closed
                if( ruleData.current === SYMBOL_LOCKED || ruleData.current === undefined )
                    continue;

                existState = currentState[ ruleData.current ];

                // Validate if exist the transition/through from a state 'A' to state 'B'
                if( existState ) {
                    if( !this.existsInState( existState, ruleData ) ) {
                        this.addProductionToState( existState, ruleData.production, ruleData.lock + 1 );
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

    Syntax.prototype.createParsingTable = function() {
        this.parsingTable = {};
        
        var state = null,
            prop = null,
            symbolReduced = '';
        
        for( let stateIdx = 0; stateIdx < this.states.length; stateIdx++ ) {
            this.parsingTable[ stateIdx ] = {};
            state = this.getState( stateIdx );
            symbolReduced = state.data[ 0 ].production.nonTerminalParent;

            if( state.data[ 0 ].current === SYMBOL_LOCKED && symbolReduced === SYMBOL_EXTEND )
                this.parsingTable[ stateIdx ][ SYMBOL_LOCKED ] = [ 'A' ]; // Accept

            else if( state.data[ 0 ].current === SYMBOL_LOCKED )
                this.parsingTable[ stateIdx ][ SYMBOL_LOCKED ] = [ 'R', state.data[ 0 ].production.length, symbolReduced ];

            for( prop in state ) {
                // Ignore those properties
                if( [ 'data', 'index' ].indexOf( prop ) !== -1 ) continue;
                
                if( !this.isTerminal( prop ) ) {
                    this.parsingTable[ stateIdx ][ prop ] = [ 'G', state[ prop ].index ];
                    continue;
                }
                
                this.parsingTable[ stateIdx ][ prop ] = [ state[ prop ].index ];
            }
        }
    };

    Syntax.prototype.searchNextStateByRule = function( rule ) {
        var mainRule = null,
            len = this.states.length;

        // Analyze all states except the zero state
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
            nextLock = rule.lock + 1,
            len = state.data.length;

        // Analyze all rules of the state except the first rule (main)
        for( let ruleIdx = 1; ruleIdx < len; ruleIdx++ ) {
            mainRule = state.data[ ruleIdx ];
            
            if( mainRule.productionStr !== rule.productionStr ) continue;
            if( mainRule.current !== rule.next ) continue;
            if( mainRule.lock !== nextLock ) continue;

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
        this.terminals = [ SYMBOL_LOCKED ];
        this.terminalActives = [ SYMBOL_LOCKED ];

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
})( {}, Stack );