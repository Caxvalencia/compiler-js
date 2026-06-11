# Documentación de compiler-js

`compiler-js` es un motor educativo de compilación escrito en TypeScript. El proyecto implementa
estructuras para:

- convertir expresiones regulares en autómatas finitos;
- ejecutar autómatas deterministas sobre texto;
- transformar código fuente en tokens y una tabla de símbolos;
- construir una tabla de análisis sintáctico desde una gramática;
- validar una secuencia de tokens con esa tabla.

## Contenido

- [Arquitectura y procesos](./arquitectura-y-procesos.md): componentes, flujo de datos y ejemplos
  completos.
- [Referencia de clases](./clases.md): responsabilidad, propiedades y métodos de cada clase.
- [Desarrollo](./desarrollo.md): instalación, scripts, pruebas y convenciones.

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

## Estado actual

El proyecto soporta un subconjunto deliberadamente pequeño de expresiones regulares:

| Operador | Significado             |
| -------- | ----------------------- |
| `AB`     | Concatenación           |
| `A\|B`   | Unión                   |
| `A*`     | Cero o más repeticiones |
| `A+`     | Una o más repeticiones  |
| `(A\|B)` | Agrupación              |

No es un reemplazo de `RegExp` de JavaScript ni un compilador completo. Su objetivo es exponer las
estructuras y transformaciones internas de un compilador.
