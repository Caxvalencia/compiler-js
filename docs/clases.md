# Referencia de clases

Esta referencia describe la API que existe hoy en `src/`. El proyecto no tiene un barrel
`index.ts`, así que los imports se hacen desde el archivo concreto de cada clase.

## Fachadas y analizadores

### `RegularExpresion`

Archivo: `src/regular-expresion.ts`

Fachada para convertir y ejecutar expresiones regulares simples.

```ts
import { RegularExpresion } from '../src/regular-expresion';
```

| Miembro                       | Descripción                                                      |
| ----------------------------- | ---------------------------------------------------------------- |
| `constructor(regExp, flags?)` | Guarda la expresión y sus banderas opcionales.                   |
| `toNonDeterministic()`        | Convierte la expresión en un AFN-e y devuelve su estado inicial. |
| `toDeterministic()`           | Convierte la expresión en un AFD y devuelve su estado inicial.   |
| `match(text)`                 | Ejecuta el AFD mapeado y devuelve un objeto `Matched`.           |
| `setFlags(flags)`             | Registra banderas `g` o `u`, aunque hoy no alteran el análisis.  |

`Matched` contiene:

| Campo     | Tipo      | Descripción                                 |
| --------- | --------- | ------------------------------------------- |
| `isValid` | `boolean` | Indica si hubo aceptación.                  |
| `finded`  | `string`  | Subcadena encontrada.                       |
| `start`   | `number`  | Índice inicial de la coincidencia o `null`. |
| `end`     | `number`  | Índice final exclusivo de la coincidencia.  |
| `input`   | `string`  | Texto original enviado a `match()`.         |

### `Lex`

Archivo: `src/lex.ts`

Analizador léxico configurable.

```ts
import { Lex } from '../src/lex';
```

| Miembro                          | Descripción                                               |
| -------------------------------- | --------------------------------------------------------- |
| `constructor(lexicon?, config?)` | Configura reglas, tabla de símbolos y contador de líneas. |
| `analyze(source)`                | Genera `tokens` y `symbolTable` desde el código fuente.   |
| `addTokenRule(name, rule)`       | Agrega una regla al objeto `lexicon`.                     |
| `getTokenRules()`                | Devuelve las reglas registradas.                          |

Propiedades principales:

| Propiedad       | Descripción                                                     |
| --------------- | --------------------------------------------------------------- |
| `lexicon`       | Mapa de nombre de token a regla.                                |
| `tokens`        | Lista de tokens producidos por `analyze()`.                     |
| `symbolTable`   | Entradas de símbolos para tokens incluidos en `addSymbolTable`. |
| `inSymbolTable` | Nombres de tokens que se guardan en tabla de símbolos.          |
| `counterLines`  | Nombres de tokens usados para contar líneas.                    |
| `regExp`        | Expresión global construida desde el léxico inicial.            |

> Importante: para ejecutar `analyze()`, define las reglas como `RegExp` en el constructor.
> `addTokenRule()` no reconstruye `regExp` automáticamente.

### `Syntax`

Archivo: `src/syntax.ts`

Construye una tabla de análisis sintáctico y valida tokens generados por `Lex`.

```ts
import { Syntax } from '../src/syntax';
```

| Miembro                                          | Descripción                                             |
| ------------------------------------------------ | ------------------------------------------------------- |
| `constructor(grammar, lex)`                      | Configura la gramática, terminales, estados y tabla.    |
| `analyze()`                                      | Evalúa todos los tokens y devuelve si fueron aceptados. |
| `eval(token, nextToken)`                         | Ejecuta una acción de la tabla para un token.           |
| `setTokens(tokens)`                              | Actualiza los tokens que serán analizados.              |
| `setSymbolTable(table)`                          | Actualiza la tabla de símbolos usada para errores.      |
| `setLex(lex)`                                    | Configura terminales y copia datos del lexer.           |
| `createState(production, lock)`                  | Crea un estado sintáctico.                              |
| `createStateData(production, lock)`              | Crea metadatos de una producción en un estado.          |
| `addProductionToState(state, production, lock?)` | Agrega una producción a un estado.                      |
| `searchNextStateByRule(rule)`                    | Busca un estado compatible con una producción.          |
| `getState(index)`                                | Obtiene un estado por índice.                           |
| `isTerminal(item)`                               | Indica si un símbolo es terminal.                       |

Propiedades relevantes:

| Propiedad         | Descripción                                    |
| ----------------- | ---------------------------------------------- |
| `grammar`         | Gramática extendida y normalizada a arreglos.  |
| `terminals`       | Terminales detectados desde el lexer más `$`.  |
| `terminalActives` | Terminales usados por la gramática.            |
| `states`          | Estados generados para la tabla.               |
| `parsingTable`    | Tabla de acciones usada por `eval()`.          |
| `stack`           | Pila de estados durante `analyze()`.           |
| `tokens`          | Tokens que serán analizados.                   |
| `symbolTable`     | Tabla de símbolos usada para reportar errores. |

Las producciones se escriben como strings separados por espacios:

```ts
const grammar = {
  E: ['E + T', 'T'],
  T: ['T * F', 'F'],
  F: ['NUMBER', '( E )']
};
```

### `Stack`

Archivo: `src/stack.ts`

Pila numérica utilizada por `Syntax`.

| Miembro         | Descripción                           |
| --------------- | ------------------------------------- |
| `constructor()` | Inicializa la pila con el estado `0`. |
| `push(state)`   | Agrega un estado.                     |
| `goto(state)`   | Alias semántico de `push()`.          |
| `reduce(count)` | Elimina una cantidad de estados.      |
| `getStack()`    | Devuelve el arreglo interno.          |
| `top`           | Estado ubicado en la parte superior.  |

## Núcleo de autómatas

### `State`

Archivo: `src/finite-state-machine/state.ts`

Nodo de un autómata. Guarda un identificador, el indicador `isAccepted` y un mapa de transiciones.

| Miembro                                      | Descripción                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `constructor(symbol?, states?, isAccepted?)` | Crea un estado, opcionalmente con una transición inicial. |
| `process(input?)`                            | Devuelve los estados alcanzables mediante un símbolo.     |
| `hasTransition(symbol)`                      | Comprueba si existe una transición.                       |
| `addTransition(symbol, states)`              | Registra o reemplaza una transición.                      |
| `getTransition(symbol)`                      | Obtiene una transición concreta.                          |
| `setTransitions(transitions)`                | Reemplaza todas las transiciones.                         |
| `getTransitions()`                           | Devuelve todas las transiciones.                          |

`Transition` tiene la forma:

```ts
type Transition = { [key: string]: Array<State> };
```

### `NonDeterministic`

Archivo: `src/finite-state-machine/non-deterministic.ts`

Convierte una expresión regular simple en un AFN-e.

| Miembro                  | Descripción                                              |
| ------------------------ | -------------------------------------------------------- |
| `constructor(source)`    | Guarda la fuente como arreglo de caracteres.             |
| `static convert(source)` | Construye y convierte una expresión en una sola llamada. |
| `convert()`              | Ejecuta la conversión de la fuente configurada.          |
| `getAlphabet()`          | Devuelve los símbolos encontrados.                       |
| `getFsm()`               | Devuelve el estado inicial del AFN-e.                    |

### `Deterministic`

Archivo: `src/finite-state-machine/deterministic.ts`

Convierte un `NonDeterministic` en AFD mediante cierres epsilon y construcción por subconjuntos.

| Miembro                      | Descripción                                  |
| ---------------------------- | -------------------------------------------- |
| `constructor(nfae)`          | Recibe un `NonDeterministic` ya convertido.  |
| `static convert(expression)` | Convierte directamente una expresión en AFD. |
| `convert()`                  | Ejecuta la determinización.                  |
| `getAlphabet()`              | Devuelve el alfabeto del autómata.           |
| `getFsm()`                   | Devuelve el estado inicial del AFD.          |

### `DeterministicMapping`

Archivo: `src/finite-state-machine/transformers/deterministic-mapping.ts`

Convierte un grafo AFD en una tabla simple consumible por `FiniteStateMachine`.

| Miembro             | Descripción                                   |
| ------------------- | --------------------------------------------- |
| `constructor()`     | Inicializa `states` y `accepts`.              |
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

`states` usa claves `<estado>-<símbolo>` y valores con el estado siguiente:

```ts
const states = {
  '1-a': '2',
  '2-a': '2',
  '2-b': '3'
};
```

## Transformadores de AFN-e

| Clase        | Archivo                                                | Responsabilidad                               |
| ------------ | ------------------------------------------------------ | --------------------------------------------- |
| `SimpleFNAe` | `src/finite-state-machine/transformers/simple-fnae.ts` | Crea un fragmento con estado inicial y final. |
| `ConcatFNAe` | `src/finite-state-machine/transformers/concat-fnae.ts` | Concatena dos fragmentos.                     |
| `UnionFNAe`  | `src/finite-state-machine/transformers/union-fnae.ts`  | Une dos alternativas.                         |
| `KleeneFNAe` | `src/finite-state-machine/transformers/kleene-fnae.ts` | Aplica repetición cero o más.                 |
| `PlusFNAe`   | `src/finite-state-machine/transformers/plus-fnae.ts`   | Aplica repetición una o más.                  |

## Utilidades, constantes e interfaces

### `Helpers`

Archivo: `src/finite-state-machine/helpers.ts`

| Miembro          | Descripción                                                 |
| ---------------- | ----------------------------------------------------------- |
| `replaceEnd()`   | Reemplaza referencias a un estado final dentro de un grafo. |
| `makeIterator()` | Crea un iterador sencillo que puede avanzar y retroceder.   |

### `Operators`

Archivo: `src/finite-state-machine/constants/operators.ts`

| Constante           | Valor |
| ------------------- | ----- |
| `EPSILON`           | `#E`  |
| `ZERO_OR_MANY`      | `*`   |
| `ONE_OR_MANY`       | `+`   |
| `OR`                | `\|`  |
| `PARENTHESIS_OPEN`  | `(`   |
| `PARENTHESIS_CLOSE` | `)`   |

### Interfaces

| Interfaz              | Archivo                                                       | Descripción                                         |
| --------------------- | ------------------------------------------------------------- | --------------------------------------------------- |
| `IFiniteStateMachine` | `src/finite-state-machine/interfaces/finite-state-machine.ts` | Contrato para clases con alfabeto y estado inicial. |
| `ISimpleFSM`          | `src/finite-state-machine/interfaces/simple-fsm.ts`           | Contrato de fragmentos con estados `init` y `end`.  |
