[![License](https://poser.pugx.org/laravel/framework/license.svg)](#)

# Compiler engine with JavaScript

A compiler engine written with JavaScript

## Install

Install the node packages via:

> npm install

### Running test

> npm test

## Finite State Machine (FSM)

```ts
// Constructor
FiniteStateMachine(states, accepts: Array<number>)
```

```js
// Set of states to describe the language regular
// a+b
const states = {
    '1-a': 2,
    '2-a': 2,
    '2-b': 3
};

const acceptationStates = [3];

const fsm = new FiniteStateMachine(states, acceptationStates);

fsm.process('aaaaaaab', 1); // is true
```
