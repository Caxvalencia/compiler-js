

class FiniteStateMachine {
    
    constructor( string, currentState, states, accepts ) {
        this.string = string;
        this.currentState = currentState;
        this.states = states;
        this.accepts = accepts;

        this.isAccepted = this.run( this.string );
    }

    run( string ) {
        if( string === '' ) {
            return this.accepts.indexOf( this.currentState ) !== -1;
        }

        let character = string[ 0 ];
        let state = this.states[ this.currentState + ' ' + character ];

        if( state === undefined ) {
            return false;
        }

        this.currentState = state;

        return this.run( string.substr( 1 ) );
    }

    fromRegularExpression( regularExpression ) {

    }
}

module.exports = FiniteStateMachine;

var states = {
    '1 a': 2,
    '2 a': 2,
    '2 b': 3
};

let fsm = new FiniteStateMachine( 'aaaaaaab', 1, states, [ 3 ]);

console.log( fsm );
