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
	Stack.prototype.push = function( stateTarget ) {
		this._stack.push( stateTarget );
		this.setTop();
	};

	Stack.prototype.goto = function( stateTarget ) {
		this.push( stateTarget );
	};

	Stack.prototype.reduce = function( cant, funcBack ) {
		for( let idx = 0; idx < cant; idx++ ) {
			this._stack.pop();
		}

		this.setTop();
	};

	return Stack;
})();