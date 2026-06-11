# Referencia de clases

## Fachadas y analizadores

### `RegularExpresion`

Archivo: `src/regular-expresion.ts`

Fachada principal para convertir y ejecutar expresiones regulares.

| Miembro                       | Descripción                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `constructor(regExp, flags?)` | Guarda la expresión y sus banderas opcionales.                   |
| `toNonDeterministic()`        | Convierte la expresión en un AFN-e y devuelve su estado inicial. |
| `toDeterministic()`           | Convierte la expresión en un AFD y devuelve su estado inicial.   |
| `match(text)`                 | Ejecuta el AFD y devuelve `Matched`.                             |
| `setFlags(flags)`             | Registra las banderas `g` o `u`.                                 |

`Matched` contiene `isValid`, `finded`, `start`, `end` e `input`.

### `Lex`

Archivo: `src/lex.ts`

Analizador léxico configurable.

| Miembro                          | Descripción                                               |
| -------------------------------- | --------------------------------------------------------- |
| `constructor(lexicon?, config?)` | Configura reglas, tabla de símbolos y contador de líneas. |
| `analyze(source)`                | Genera `tokens` y `symbolTable` desde el código fuente.   |
| `addTokenRule(name, rule)`       | Agrega una regla al léxico.                               |
| `getTokenRules()`                | Devuelve las reglas registradas.                          |

Propiedades de salida principales: `tokens` y `symbolTable`.

### `Syntax`

Archivo: `src/syntax.ts`

Construye una tabla de análisis sintáctico y valida los tokens de un lexer.

| Miembro                                          | Descripción                                             |
| ------------------------------------------------ | ------------------------------------------------------- |
| `constructor(grammar, lex)`                      | Configura la gramática, terminales, estados y tabla.    |
| `analyze()`                                      | Evalúa todos los tokens y devuelve si fueron aceptados. |
| `eval(token, nextToken)`                         | Ejecuta una acción de la tabla.                         |
| `setTokens(tokens)`                              | Actualiza los tokens que serán analizados.              |
| `setSymbolTable(table)`                          | Actualiza la tabla de símbolos usada para errores.      |
| `setLex(lex)`                                    | Configura terminales y copia datos del lexer.           |
| `createState(production, lock)`                  | Crea un estado sintáctico.                              |
| `createStateData(production, lock)`              | Crea los metadatos de una producción en un estado.      |
| `addProductionToState(state, production, lock?)` | Agrega una producción a un estado.                      |
| `getState(index)`                                | Obtiene un estado por índice.                           |
| `isTerminal(item)`                               | Indica si un símbolo es terminal.                       |

### `Stack`

Archivo: `src/stack.ts`

Pila numérica utilizada por `Syntax`.

| Miembro         | Descripción                          |
| --------------- | ------------------------------------ |
| `push(state)`   | Agrega un estado.                    |
| `goto(state)`   | Alias semántico de `push()`.         |
| `reduce(count)` | Elimina una cantidad de estados.     |
| `getStack()`    | Devuelve el arreglo interno.         |
| `top`           | Estado ubicado en la parte superior. |

## Núcleo de autómatas

### `State`

Archivo: `src/finite-state-machine/state.ts`

Nodo de un autómata. Guarda un identificador, el indicador `isAccepted` y un mapa de transiciones.

| Miembro                         | Descripción                                           |
| ------------------------------- | ----------------------------------------------------- |
| `process(input?)`               | Devuelve los estados alcanzables mediante un símbolo. |
| `hasTransition(symbol)`         | Comprueba si existe una transición.                   |
| `addTransition(symbol, states)` | Registra o reemplaza una transición.                  |
| `getTransition(symbol)`         | Obtiene una transición concreta.                      |
| `setTransitions(transitions)`   | Reemplaza todas las transiciones.                     |
| `getTransitions()`              | Devuelve todas las transiciones.                      |

### `NonDeterministic`

Archivo: `src/finite-state-machine/non-deterministic.ts`

Convierte una expresión regular en un AFN-e.

| Miembro                  | Descripción                                              |
| ------------------------ | -------------------------------------------------------- |
| `static convert(source)` | Construye y convierte una expresión en una sola llamada. |
| `convert()`              | Ejecuta la conversión de la fuente configurada.          |
| `getAlphabet()`          | Devuelve los símbolos encontrados.                       |
| `getFsm()`               | Devuelve el estado inicial del AFN-e.                    |

### `Deterministic`

Archivo: `src/finite-state-machine/deterministic.ts`

Convierte un `NonDeterministic` en AFD mediante cierres epsilon y construcción por subconjuntos.

| Miembro                      | Descripción                                  |
| ---------------------------- | -------------------------------------------- |
| `static convert(expression)` | Convierte directamente una expresión en AFD. |
| `convert()`                  | Ejecuta la determinización.                  |
| `getAlphabet()`              | Devuelve el alfabeto del autómata.           |
| `getFsm()`                   | Devuelve el estado inicial del AFD.          |

### `DeterministicMapping`

Archivo: `src/finite-state-machine/transformers/deterministic-mapping.ts`

Convierte un grafo AFD en una tabla simple consumible por `FiniteStateMachine`.

| Miembro             | Descripción                                   |
| ------------------- | --------------------------------------------- |
| `static apply(dfa)` | Genera el mapeo desde el estado inicial.      |
| `states`            | Mapa `<estado>-<símbolo>` a siguiente estado. |
| `accepts`           | Identificadores de estados aceptados.         |

### `FiniteStateMachine`

Archivo: `src/finite-state-machine/finite-state-machine.ts`

Ejecutor de una tabla determinista.

| Miembro                         | Descripción                                    |
| ------------------------------- | ---------------------------------------------- |
| `constructor(states, accepts)`  | Recibe transiciones y estados aceptados.       |
| `process(input, stateInitial?)` | Procesa texto desde el estado indicado.        |
| `start()`                       | Devuelve el índice inicial de la coincidencia. |
| `end()`                         | Devuelve el índice final exclusivo.            |

## Transformadores de AFN-e

| Clase        | Archivo                       | Responsabilidad                               |
| ------------ | ----------------------------- | --------------------------------------------- |
| `SimpleFNAe` | `transformers/simple-fnae.ts` | Crea un fragmento con estado inicial y final. |
| `ConcatFNAe` | `transformers/concat-fnae.ts` | Concatena dos fragmentos.                     |
| `UnionFNAe`  | `transformers/union-fnae.ts`  | Une dos alternativas.                         |
| `KleeneFNAe` | `transformers/kleene-fnae.ts` | Aplica repetición cero o más.                 |
| `PlusFNAe`   | `transformers/plus-fnae.ts`   | Aplica repetición una o más.                  |

## Utilidades, constantes e interfaces

### `Helpers`

Archivo: `src/finite-state-machine/helpers.ts`

- `replaceEnd()`: reemplaza referencias a un estado final dentro de un grafo.
- `makeIterator()`: crea un iterador sencillo que puede avanzar y retroceder.

### `Operators`

Archivo: `src/finite-state-machine/constants/operators.ts`

Define los símbolos internos y operadores reconocidos: epsilon, `*`, `+`, `|`, `(` y `)`.

### Interfaces

- `IFiniteStateMachine`: contrato para clases convertibles con alfabeto y estado inicial.
- `ISimpleFSM`: contrato de fragmentos con estados `init` y `end`.
