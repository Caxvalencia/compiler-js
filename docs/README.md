# Documentación de compiler-js

`compiler-js` es un motor educativo de compilación escrito en TypeScript. El proyecto implementa
estructuras pequeñas y explícitas para recorrer un flujo típico de compilador:

- convertir expresiones regulares en autómatas finitos;
- ejecutar autómatas deterministas sobre texto;
- transformar código fuente en tokens y tabla de símbolos;
- construir una tabla de análisis sintáctico desde una gramática;
- validar una secuencia de tokens con esa tabla.

## Contenido

- [Arquitectura y procesos](./arquitectura-y-procesos.md): estructura del proyecto, flujo de datos,
  ejemplos completos y limitaciones.
- [Referencia de clases](./clases.md): responsabilidad, propiedades y métodos de cada clase.
- [Desarrollo](./desarrollo.md): instalación, scripts, pruebas, salidas generadas y convenciones.

## Mapa rápido

```text
Expresión regular
    |
    v
NonDeterministic -> State (AFN-e)
    |
    v
Deterministic -> State (AFD)
    |
    v
DeterministicMapping -> tabla de transiciones
    |
    v
FiniteStateMachine -> resultado de ejecución

Código fuente -> Lex -> tokens + tabla de símbolos -> Syntax -> aceptación/rechazo
```

## Módulos principales

| Módulo                 | Responsabilidad                                          |
| ---------------------- | -------------------------------------------------------- |
| `RegularExpresion`     | Fachada para convertir y ejecutar expresiones regulares. |
| `NonDeterministic`     | Construye un AFN-e desde una expresión regular simple.   |
| `Deterministic`        | Convierte AFN-e en AFD.                                  |
| `DeterministicMapping` | Aplana un AFD en una tabla de transiciones.              |
| `FiniteStateMachine`   | Ejecuta una tabla determinista sobre una cadena.         |
| `Lex`                  | Tokeniza código fuente y genera tabla de símbolos.       |
| `Syntax`               | Valida tokens usando una gramática y tabla de acciones.  |
| `Stack`                | Pila de estados usada por `Syntax`.                      |
| `State`                | Nodo con transiciones para AFN-e y AFD.                  |

## Operadores de expresiones regulares

El soporte de expresiones regulares es intencionalmente pequeño:

| Operador | Significado             |
| -------- | ----------------------- |
| `AB`     | Concatenación           |
| `A\|B`   | Unión                   |
| `A*`     | Cero o más repeticiones |
| `A+`     | Una o más repeticiones  |
| `(A\|B)` | Agrupación              |

Las expresiones se procesan carácter por carácter. No hay soporte general para escapes, clases de
caracteres, rangos, cuantificadores avanzados ni precedencia completa como en `RegExp`.

## Importante

- No existe un archivo `index.ts` que reexporte toda la API; los ejemplos importan desde rutas
  concretas dentro de `src/`.
- `Lex` espera reglas como objetos `RegExp` cuando se quiere ejecutar `analyze()`.
- `Syntax` copia tokens y tabla de símbolos desde el lexer al construirse. Si se ejecuta el lexer
  después, hay que llamar `setTokens()` y `setSymbolTable()` antes de analizar.
- `Syntax.eval()` escribe trazas con `console.log()` durante el análisis.
