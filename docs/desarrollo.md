# Desarrollo

## Requisitos

- Node.js compatible con TypeScript 6.
- pnpm `10.33.0`, indicado en `package.json`.

## Instalación

```bash
pnpm install
```

El repositorio utiliza `pnpm-lock.yaml`. Evita generar lockfiles de npm o Yarn.

## Scripts

| Comando             | Descripción                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm build`        | Compila TypeScript en `build/`.                          |
| `pnpm test`         | Compila, ejecuta las pruebas y genera cobertura con c8.  |
| `pnpm watch`        | Observa cambios de TypeScript y vuelve a ejecutar Mocha. |
| `pnpm format`       | Formatea el repositorio con Prettier.                    |
| `pnpm format:check` | Verifica el formato sin modificar archivos.              |

## Flujo recomendado

1. Instalar dependencias con `pnpm install`.
2. Modificar clases dentro de `src/`.
3. Agregar o actualizar pruebas en `src/tests/`.
4. Ejecutar `pnpm format`.
5. Ejecutar `pnpm test`.
6. Ejecutar `pnpm format:check`.

## Pruebas

Las pruebas usan Mocha, Chai y decoradores de `@testdeck/mocha`.

```ts
import { assert } from 'chai';
import { suite, test } from '@testdeck/mocha';

@suite
export class ExampleTest {
  @test
  public validatesBehavior() {
    assert.isTrue(true);
  }
}
```

La suite actual cubre:

- construcción de AFN-e;
- conversión a AFD;
- mapeo de estados deterministas;
- ejecución de máquinas de estados;
- localización de coincidencias en `RegularExpresion.match()`;
- análisis léxico;
- análisis sintáctico básico para expresiones aritméticas.

## Configuración TypeScript

El proyecto compila desde `src/` hacia `build/` con:

- `module: commonjs`;
- `target: es6`;
- `rootDir: src`;
- `outDir: build`;
- `strict: false`;
- `experimentalDecorators: true`, necesario para las pruebas con `@testdeck/mocha`.

## Salidas generadas

Estas rutas se generan durante build, pruebas o cobertura:

| Ruta        | Origen                     |
| ----------- | -------------------------- |
| `build/`    | `pnpm build` y `pnpm test` |
| `coverage/` | Reporte de cobertura de c8 |

## Convenciones del código actual

- Las clases principales viven en archivos individuales dentro de `src/`.
- No hay un punto de entrada público que reexporte toda la API.
- Los tests importan directamente desde `src/`.
- Las reglas del lexer deben definirse como `RegExp` cuando se usa `analyze()`.
- Las producciones de gramática de `Syntax` separan símbolos con espacios.
- El código mantiene algunos nombres históricos, por ejemplo `RegularExpresion`, `SintaxTest` y
  `finded`.

## Antes de integrar cambios

Ejecuta:

```bash
pnpm test
pnpm format:check
```

`pnpm test` compila antes de correr Mocha, así que también valida errores de TypeScript.
