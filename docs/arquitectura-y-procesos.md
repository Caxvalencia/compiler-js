# Arquitectura y procesos

## Estructura del proyecto

```text
src/
├── finite-state-machine/
│   ├── constants/       Operadores reconocidos
│   ├── interfaces/      Contratos de autómatas
│   ├── transformers/    Construcción y transformación de fragmentos AFN-e
│   ├── deterministic.ts Conversión de AFN-e a AFD
│   ├── non-deterministic.ts
│   ├── finite-state-machine.ts
│   ├── helpers.ts
│   └── state.ts
├── tests/               Pruebas unitarias
├── lex.ts               Analizador léxico
├── regular-expresion.ts Fachada para expresiones regulares
├── stack.ts             Pila del analizador sintáctico
└── syntax.ts            Analizador sintáctico
```

## Proceso de expresiones regulares

### 1. Construcción del AFN-e

`NonDeterministic` recibe una expresión como texto, la separa en caracteres y construye un grafo de
objetos `State`. Cada símbolo normal crea un fragmento `SimpleFNAe`; los operadores aplican
transformaciones sobre el fragmento actual o sobre fragmentos previos.

| Transformador | Uso                                            |
| ------------- | ---------------------------------------------- |
| `SimpleFNAe`  | Crea un fragmento con estado inicial y final.  |
| `ConcatFNAe`  | Conecta dos fragmentos con transición epsilon. |
| `UnionFNAe`   | Crea una bifurcación entre dos alternativas.   |
| `KleeneFNAe`  | Permite cero o más repeticiones.               |
| `PlusFNAe`    | Permite una o más repeticiones.                |

El símbolo epsilon interno es `#E`, definido en `Operators.EPSILON`.

```ts
import { NonDeterministic } from '../src/finite-state-machine/non-deterministic';

const nfae = NonDeterministic.convert('A+B*');

console.log(nfae.getAlphabet()); // ['A', 'B']
console.log(nfae.getFsm()); // State inicial del AFN-e
```

### 2. Conversión del AFN-e a AFD

`Deterministic` aplica construcción por subconjuntos:

1. indexa los estados del AFN-e;
2. calcula el cierre epsilon del estado inicial;
3. agrupa estados alcanzables por cada símbolo del alfabeto;
4. crea un estado determinista por cada conjunto nuevo;
5. marca como aceptado el estado determinista si alguno de sus estados agrupados era aceptado;
6. vuelve a indexar el AFD resultante con identificadores simples.

```ts
import { Deterministic } from '../src/finite-state-machine/deterministic';

const dfa = Deterministic.convert('A+B*');

console.log(dfa.getAlphabet()); // ['A', 'B']
console.log(dfa.getFsm()); // State inicial del AFD
```

### 3. Mapeo del AFD

`DeterministicMapping` convierte el grafo determinista en una tabla plana consumible por
`FiniteStateMachine`.

```ts
import { Deterministic } from '../src/finite-state-machine/deterministic';
import { DeterministicMapping } from '../src/finite-state-machine/transformers/deterministic-mapping';

const dfa = Deterministic.convert('A+B*').getFsm();
const mapped = DeterministicMapping.apply(dfa);

console.log(mapped.states);
console.log(mapped.accepts);
```

Cada transición se guarda con la forma `<estado>-<símbolo>`:

```ts
{
  '0-A': '1',
  '1-A': '1',
  '1-B': '2',
  '2-B': '2'
}
```

`accepts` contiene los identificadores de estados aceptados.

### 4. Ejecución

`FiniteStateMachine` consume una cadena carácter por carácter usando una tabla determinista. Si no
encuentra transición al inicio, avanza en el texto hasta encontrar una posible coincidencia. Por eso
`RegularExpresion.match()` puede encontrar una expresión dentro de una cadena más larga.

```ts
import { RegularExpresion } from '../src/regular-expresion';

const expression = new RegularExpresion('A+B*');
const result = expression.match('XXAAAB');

result.isValid; // true
result.finded; // 'AAAB'
result.start; // 2
result.end; // 6
result.input; // 'XXAAAB'
```

Si la expresión puede aceptar cadena vacía, `start` puede ser `null` y `end` puede ser `0`.

## Proceso léxico

`Lex` transforma código fuente en:

- `tokens`: pares `[tipo, valor]` o `[tipo, índiceDeSímbolo]`;
- `symbolTable`: datos detallados de los tokens configurados para almacenarse.

### Configuración

```ts
import { Lex } from '../src/lex';

const lex = new Lex(
  {
    NUMBER: /\-?[0-9]*\.?[0-9]+/,
    '+': /\+/,
    NEW_LINE: /[\n\r]/
  },
  {
    addSymbolTable: ['NUMBER'],
    counterLines: ['NEW_LINE']
  }
);

lex.analyze('10+20');

lex.tokens; // [['NUMBER', 0], ['+', '+'], ['NUMBER', 1]]
lex.symbolTable; // entradas para los NUMBER encontrados
```

El flujo interno es:

1. el constructor combina las reglas del léxico en una expresión global;
2. `analyze()` busca coincidencias en el código fuente;
3. `getTokenId()` determina el primer tipo de token compatible;
4. los tokens configurados en `addSymbolTable` se guardan en la tabla de símbolos;
5. el resto conserva directamente su lexema en `tokens`;
6. los tokens `NEW_LINE` incrementan el contador de líneas y no se agregan a `tokens`.

> Nota: `addTokenRule()` solo modifica el objeto `lexicon`; actualmente no reconstruye la expresión
> global usada por `analyze()`. Para analizar texto, pasa las reglas al constructor.

## Proceso sintáctico

`Syntax` recibe una gramática y una instancia de `Lex`. En el constructor:

1. extiende la gramática con `_G'`;
2. separa cada producción por espacios;
3. registra terminales desde el lexer;
4. crea estados;
5. construye la tabla de análisis.

```ts
import { Lex } from '../src/lex';
import { Syntax } from '../src/syntax';

const lexicon = {
  '(': /\(/,
  ')': /\)/,
  '+': /\+/,
  '*': /\*/,
  NUMBER: /\-?[0-9]*\.?[0-9]+/
};

const grammar = {
  E: ['E + T', 'T'],
  T: ['T * F', 'F'],
  F: ['NUMBER', '( E )']
};

const lexer = new Lex(lexicon, {
  addSymbolTable: ['NUMBER']
});

const syntax = new Syntax(grammar, lexer);

lexer.analyze('5 + 5 * (5+5)');
syntax.setTokens(lexer.tokens);
syntax.setSymbolTable(lexer.symbolTable);

const accepted = syntax.analyze();
```

### Tabla de análisis

`createParsingTable()` genera acciones con esta forma:

| Acción | Significado                |
| ------ | -------------------------- |
| `A`    | Aceptar                    |
| `R`    | Reducir una producción     |
| `G`    | Ir a otro estado           |
| Número | Desplazar/apilar el estado |

`Stack` guarda estados numéricos. Las reducciones eliminan estados de la pila y los `goto` agregan
el estado siguiente.

## Limitaciones conocidas

- Las expresiones regulares se procesan carácter por carácter.
- No hay soporte general para escapes, clases de caracteres, rangos ni cuantificadores avanzados.
- La unión (`|`) y la agrupación cubren casos simples; no implementan toda la precedencia de
  `RegExp`.
- `Lex.addTokenRule()` no actualiza la expresión interna usada por `analyze()`.
- El lexer detiene el análisis cuando encuentra un carácter sin regla compatible.
- `Syntax` usa estructuras dinámicas con tipado amplio.
- Las producciones de `Syntax` dependen de espacios para separar símbolos.
- `Syntax.eval()` escribe trazas en consola durante el análisis.
- No existe todavía un punto de entrada público que reexporte todas las clases.
