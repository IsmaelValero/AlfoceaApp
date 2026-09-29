import type { DataAdapter } from "@/lib/db/adapter";
import { createJsonAdapter } from "@/lib/db/json-adapter";

/**
 * Punto unico donde se elige el almacenamiento.
 *
 * Para migrar a una base de datos real basta con escribir un adaptador que
 * cumpla DataAdapter y devolverlo aqui; ninguna pantalla necesita cambios.
 */
function buildAdapter(): DataAdapter {
  return createJsonAdapter();
}

// En desarrollo Next recarga los modulos en caliente; reutilizar la instancia
// evita multiplicar las colas de escritura sobre los mismos ficheros.
const globalForDb = globalThis as unknown as { __alfoceaDb?: DataAdapter };

export const db: DataAdapter = globalForDb.__alfoceaDb ?? buildAdapter();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__alfoceaDb = db;
}
