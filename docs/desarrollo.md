# Desarrollo

## Requisitos

- Node.js compatible con TypeScript 6.
- pnpm 10.33.0, indicado en `package.json`.

## Instalación

```bash
pnpm install
```

El repositorio utiliza exclusivamente `pnpm-lock.yaml`. No se deben generar lockfiles de npm o
Yarn.

## Scripts

| Comando             | Descripción                                              |
| ------------------- | -------------------------------------------------------- |
| `pnpm build`        | Compila TypeScript en `build/`.                          |
| `pnpm test`         | Compila, ejecuta las pruebas y genera cobertura con NYC. |
| `pnpm watch`        | Observa cambios de TypeScript y vuelve a ejecutar Mocha. |
| `pnpm format`       | Formatea el repositorio con Prettier.                    |
| `pnpm format:check` | Verifica el formato sin modificar archivos.              |

## Flujo recomendado para cambios

1. Instalar dependencias con `pnpm install`.
2. Modificar las clases dentro de `src/`.
3. Agregar o actualizar pruebas en `src/tests/`.
4. Ejecutar `pnpm format`.
5. Ejecutar `pnpm test`.
6. Ejecutar `pnpm format:check` antes de integrar el cambio.

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

La suite cubre:

- creación de AFN-e;
- conversión a AFD;
- mapeo de estados deterministas;
- ejecución y localización de coincidencias;
- análisis léxico;
- análisis sintáctico.

## Salidas generadas

- `build/`: JavaScript compilado y mapas de fuente.
- `coverage/`: reporte de cobertura.
- `.nyc_output/`: datos intermedios de NYC.

Estas rutas están ignoradas por Git y Prettier.
