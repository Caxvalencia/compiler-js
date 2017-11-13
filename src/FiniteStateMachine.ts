

export class FiniteStateMachine {
   
    str: string;
    currentState: number;
    states: any;
    accepts: Array<number>;
    isAccepted: boolean;
    
    constructor( str: string, currentState: number, states, accepts: Array<number> ) {
        this.str = str;
        this.currentState = currentState;
        this.states = states;
        this.accepts = accepts;
        this.isAccepted = this.run( this.str );
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
