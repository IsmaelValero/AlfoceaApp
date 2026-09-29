import { promises as fs } from "node:fs";
import path from "node:path";

import { hashPassword } from "@/lib/passwords";
import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";

export interface Account {
  memberId: string;
  username: string;
  email: string;
  passwordHash: string;
}

/** Contraseña por defecto de las cuentas nuevas / seed. */
export const INITIAL_PASSWORD = "alfocea123";

const FILE = path.join(process.cwd(), "data", "accounts.json");

let queue: Promise<unknown> = Promise.resolve();

function run<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

function mapAccount(row: Record<string, unknown>): Account {
  return {
    memberId: String(row.member_id),
    username: String(row.username),
    email: String(row.email),
    passwordHash: String(row.password_hash),
  };
}

async function readLocal(): Promise<Account[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Account[]) : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    await writeLocal([]);
    return [];
  }
}

async function writeLocal(rows: Account[]) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

export function listAccounts() {
  return run(async () => {
    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("accounts")
        .select("member_id, username, email, password_hash");
      if (error) throw error;
      return (data ?? []).map((row) => mapAccount(row as unknown as Record<string, unknown>));
    }
    return readLocal();
  });
}

export function findAccountByUsername(username: string) {
  const needle = username.trim().toLowerCase();
  return run(async () => {
    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("accounts")
        .select("member_id, username, email, password_hash")
        .eq("username", needle)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAccount(data as unknown as Record<string, unknown>) : null;
    }
    return (await readLocal()).find((account) => account.username === needle) ?? null;
  });
}

export function findAccountByEmail(email: string) {
  const needle = email.trim().toLowerCase();
  return run(async () => {
    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("accounts")
        .select("member_id, username, email, password_hash")
        .eq("email", needle)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAccount(data as unknown as Record<string, unknown>) : null;
    }
    return (await readLocal()).find((account) => account.email === needle) ?? null;
  });
}

export function findAccountByLogin(login: string) {
  const needle = login.trim().toLowerCase();
  if (!needle) return Promise.resolve(null);
  if (needle.includes("@")) return findAccountByEmail(needle);
  return findAccountByUsername(needle);
}

export function findAccountByMember(memberId: string) {
  return run(async () => {
    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("accounts")
        .select("member_id, username, email, password_hash")
        .eq("member_id", memberId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAccount(data as unknown as Record<string, unknown>) : null;
    }
    return (await readLocal()).find((account) => account.memberId === memberId) ?? null;
  });
}

export function saveAccount(memberId: string, patch: Partial<Pick<Account, "email" | "passwordHash">>) {
  return run(async () => {
    if (hasSupabaseEnv()) {
      const row: Record<string, unknown> = {};
      if (patch.email !== undefined) row.email = patch.email;
      if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;

      const { data, error } = await getSupabase()
        .from("accounts")
        .update(row)
        .eq("member_id", memberId)
        .select("member_id, username, email, password_hash")
        .maybeSingle();
      if (error) throw error;
      return data ? mapAccount(data as unknown as Record<string, unknown>) : null;
    }

    const rows = await readLocal();
    const index = rows.findIndex((account) => account.memberId === memberId);
    if (index < 0) return null;
    rows[index] = { ...rows[index], ...patch };
    await writeLocal(rows);
    return rows[index];
  });
}

export function createAccount(input: Omit<Account, "passwordHash"> & { password?: string }) {
  return run(async () => {
    const account: Account = {
      memberId: input.memberId,
      username: input.username.trim().toLowerCase(),
      email: input.email.trim().toLowerCase(),
      passwordHash: hashPassword(input.password ?? INITIAL_PASSWORD),
    };

    if (hasSupabaseEnv()) {
      const { data, error } = await getSupabase()
        .from("accounts")
        .insert({
          member_id: account.memberId,
          username: account.username,
          email: account.email,
          password_hash: account.passwordHash,
        })
        .select("member_id, username, email, password_hash")
        .single();
      if (error) throw error;
      return mapAccount(data as unknown as Record<string, unknown>);
    }

    const rows = await readLocal();
    rows.push(account);
    await writeLocal(rows);
    return account;
  });
}
