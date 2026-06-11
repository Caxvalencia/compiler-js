# Arquitectura y procesos

## Estructura del proyecto

```text
src/
├── finite-state-machine/
│   ├── constants/       Operadores reconocidos
│   ├── interfaces/      Contratos de autómatas
│   ├── transformers/    Construcción y transformación de AFN-e/AFD
│   ├── deterministic.ts Conversión de AFN-e a AFD
│   ├── non-deterministic.ts
│   ├── finite-state-machine.ts
│   └── state.ts
├── tests/               Pruebas unitarias
├── lex.ts               Analizador léxico
├── regular-expresion.ts Fachada para expresiones regulares
├── stack.ts             Pila del analizador sintáctico
└── syntax.ts            Analizador sintáctico
```

## Proceso de expresiones regulares

### 1. Construcción del AFN-e

`NonDeterministic` recibe una expresión como texto y recorre sus caracteres. Cada símbolo normal
crea un `SimpleFNAe`; los operadores aplican transformaciones sobre esos fragmentos:

- `ConcatFNAe`: conecta dos fragmentos mediante una transición epsilon.
- `UnionFNAe`: crea una bifurcación para la unión.
- `KleeneFNAe`: permite cero o más repeticiones.
- `PlusFNAe`: permite una o más repeticiones.

El resultado es un grafo de objetos `State` cuyas transiciones pueden incluir `#E`, el símbolo
epsilon interno.

### 2. Conversión del AFN-e a AFD

`Deterministic` aplica construcción por subconjuntos:

1. calcula el cierre epsilon del estado inicial;
2. agrupa los estados alcanzables por cada símbolo del alfabeto;
3. crea un estado determinista por cada conjunto nuevo;
4. marca el estado como aceptado si alguno de los estados agrupados era aceptado;
5. asigna identificadores numéricos a los estados resultantes.

### 3. Mapeo del AFD

`DeterministicMapping` aplana el grafo determinista en una tabla:

```ts
{
  '0-A': '1',
  '1-A': '1'
}
```

Cada clave sigue el formato `<estado>-<símbolo>`. La lista `accepts` contiene los identificadores
de estados de aceptación.

### 4. Ejecución

`FiniteStateMachine` consume una entrada carácter por carácter usando la tabla mapeada. Además de
indicar si terminó en un estado aceptado, registra el inicio y el final de la coincidencia.

La fachada `RegularExpresion` reúne todo el proceso:

```ts
import { RegularExpresion } from '../src/regular-expresion';

const expression = new RegularExpresion('A+B*');
const result = expression.match('XXAAAB');

result.isValid; // true
result.finded; // 'AAAB'
result.start; // 2
result.end; // 6
```

## Proceso léxico

`Lex` transforma código fuente en dos salidas:

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
```

El proceso es:

1. el constructor combina las reglas del léxico en una expresión global;
2. `analyze()` busca coincidencias en el código fuente;
3. `getTokenId()` determina el primer tipo de token compatible;
4. los tokens configurados en `addSymbolTable` se guardan en la tabla de símbolos;
5. el resto conserva directamente su lexema en `tokens`.

> Importante: las reglas deben entregarse preferiblemente al constructor. `addTokenRule()` modifica
> el léxico, pero actualmente no reconstruye automáticamente la expresión global ya compilada.

## Proceso sintáctico

`Syntax` recibe una gramática y una instancia de `Lex`. Su constructor prepara los estados y la
tabla de análisis.

```ts
const grammar = {
  E: ['E + T', 'E - T', 'T'],
  T: ['T * F', 'T / F', 'F'],
  F: ['NUMBER', '( E )']
};

const syntax = new Syntax(grammar, lex);

lex.analyze('5 + 5 * (5+5)');
syntax.setTokens(lex.tokens);
syntax.setSymbolTable(lex.symbolTable);

const accepted = syntax.analyze();
```

### Construcción de la tabla

1. `configureGrammar()` separa cada producción en símbolos y agrega la producción extendida
   `_G'`.
2. `createStateInitial()` crea el estado inicial.
3. `createStates()` genera estados y transiciones desde las producciones.
4. `createParsingTable()` convierte los estados en acciones:

| Acción | Significado                |
| ------ | -------------------------- |
| `A`    | Aceptar                    |
| `R`    | Reducir una producción     |
| `G`    | Ir a otro estado           |
| Número | Desplazar/apilar el estado |

### Ejecución de la tabla

`analyze()` recorre los tokens. `eval()` consulta la acción correspondiente al estado superior de
`Stack` y al token actual. Las reducciones eliminan estados de la pila y las transiciones agregan
nuevos estados. La entrada se acepta cuando se alcanza la acción `A`.

Debido a que `Syntax` se construye antes o después de ejecutar el lexer, se recomienda actualizar
explícitamente los datos con `setTokens()` y `setSymbolTable()` antes de llamar a `analyze()`.

## Limitaciones conocidas

- Las expresiones regulares se procesan carácter por carácter; no hay soporte general para escapes,
  clases de caracteres o cuantificadores avanzados.
- El analizador sintáctico utiliza estructuras dinámicas con tipado amplio.
- El lexer detiene el análisis al encontrar un carácter sin regla compatible.
- `Syntax.eval()` escribe trazas en consola durante el análisis.
- No existe todavía un punto de entrada público que reexporte todas las clases.
