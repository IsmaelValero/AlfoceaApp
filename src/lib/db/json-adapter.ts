import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import type { Collection, DataAdapter } from "@/lib/db/adapter";
import { seedFamilies, seedManuals, seedMembers, seedReservations, seedRules } from "@/lib/db/seed";
import type { Entity, Family, Manual, Member, Reservation, Rule } from "@/lib/types";

/**
 * Adaptador de desarrollo: un fichero JSON por coleccion dentro de /data.
 *
 * Pensado para arrancar sin depender de ningun servicio externo. No sirve para
 * un despliegue serverless (Vercel), donde el sistema de ficheros es efimero:
 * cuando llegue ese momento se escribe otro adaptador contra la base de datos
 * elegida y se cambia unicamente src/lib/db/index.ts.
 */

const DATA_DIR = process.env.ALFOCEA_DATA_DIR ?? path.join(process.cwd(), "data");

class JsonCollection<T extends Entity> implements Collection<T> {
  private readonly file: string;
  /** Cadena de promesas que serializa lecturas y escrituras sobre el fichero. */
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    name: string,
    private readonly seed: () => T[],
  ) {
    this.file = path.join(DATA_DIR, `${name}.json`);
  }

  private run<R>(task: () => Promise<R>): Promise<R> {
    const result = this.queue.then(task, task);
    // La cola no debe romperse si una operacion falla.
    this.queue = result.catch(() => undefined);
    return result;
  }

  private async readAll(): Promise<T[]> {
    try {
      const raw = await fs.readFile(this.file, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const initial = this.seed();
      await this.writeAll(initial);
      return initial;
    }
  }

  private async writeAll(rows: T[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${this.file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
    await fs.rename(tmp, this.file);
  }

  list(): Promise<T[]> {
    return this.run(() => this.readAll());
  }

  get(id: string): Promise<T | null> {
    return this.run(async () => {
      const rows = await this.readAll();
      return rows.find((row) => row.id === id) ?? null;
    });
  }

  create(data: Omit<T, "id">): Promise<T> {
    return this.run(async () => {
      const rows = await this.readAll();
      const created = { ...data, id: randomUUID() } as unknown as T;
      rows.push(created);
      await this.writeAll(rows);
      return created;
    });
  }

  update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | null> {
    return this.run(async () => {
      const rows = await this.readAll();
      const index = rows.findIndex((row) => row.id === id);
      if (index === -1) return null;
      const updated = { ...rows[index], ...patch, id } as unknown as T;
      rows[index] = updated;
      await this.writeAll(rows);
      return updated;
    });
  }

  remove(id: string): Promise<boolean> {
    return this.run(async () => {
      const rows = await this.readAll();
      const next = rows.filter((row) => row.id !== id);
      if (next.length === rows.length) return false;
      await this.writeAll(next);
      return true;
    });
  }
}

export function createJsonAdapter(): DataAdapter {
  return {
    families: new JsonCollection<Family>("families", seedFamilies),
    members: new JsonCollection<Member>("members", seedMembers),
    reservations: new JsonCollection<Reservation>("reservations", seedReservations),
    manuals: new JsonCollection<Manual>("manuals", seedManuals),
    rules: new JsonCollection<Rule>("rules", seedRules),
  };
}
