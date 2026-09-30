import { promises as fs } from "node:fs";
import path from "node:path";

import { hashPassword } from "@/lib/passwords";
import { getSupabase, hasSupabaseEnv } from "@/lib/supabase";

export interface Account {
  memberId: string;
  username: string;
  email: string;
  passwordHash: string;
  notificationLastReadAt?: string;
  dismissedNotificationIds: string[];
}

/** Contraseña por defecto de las cuentas nuevas / seed. */
export const INITIAL_PASSWORD = "alfocea123";

const FILE = path.join(process.cwd(), "data", "accounts.json");
const ACCOUNT_COLUMNS =
  "member_id, username, email, password_hash, notification_last_read_at, dismissed_notification_ids";
const ACCOUNT_COLUMNS_BASE = "member_id, username, email, password_hash";

let accountNotifyReady: boolean | null = null;

let queue: Promise<unknown> = Promise.resolve();

function run<T>(task: () => Promise<T>): Promise<T> {
  const result = queue.then(task, task);
  queue = result.catch(() => undefined);
  return result;
}

function parseDismissed(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(String).filter(Boolean);
}

function mapAccount(row: Record<string, unknown>): Account {
  return {
    memberId: String(row.member_id),
    username: String(row.username),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    notificationLastReadAt: row.notification_last_read_at
      ? String(row.notification_last_read_at)
      : undefined,
    dismissedNotificationIds: parseDismissed(row.dismissed_notification_ids),
  };
}

async function accountSelectColumns() {
  if (accountNotifyReady === true) return ACCOUNT_COLUMNS;
  if (accountNotifyReady === false) return ACCOUNT_COLUMNS_BASE;
  const { error } = await getSupabase().from("accounts").select("notification_last_read_at").limit(1);
  accountNotifyReady = !error;
  return accountNotifyReady ? ACCOUNT_COLUMNS : ACCOUNT_COLUMNS_BASE;
}

async function readLocal(): Promise<Account[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as Account[]).map((account) => ({
      ...account,
      dismissedNotificationIds: account.dismissedNotificationIds ?? [],
    }));
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
      const columns = await accountSelectColumns();
      const { data, error } = await getSupabase().from("accounts").select(columns);
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
      const columns = await accountSelectColumns();
      const { data, error } = await getSupabase()
        .from("accounts")
        .select(columns)
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
      const columns = await accountSelectColumns();
      const { data, error } = await getSupabase()
        .from("accounts")
        .select(columns)
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
      const columns = await accountSelectColumns();
      const { data, error } = await getSupabase()
        .from("accounts")
        .select(columns)
        .eq("member_id", memberId)
        .maybeSingle();
      if (error) throw error;
      return data ? mapAccount(data as unknown as Record<string, unknown>) : null;
    }
    return (await readLocal()).find((account) => account.memberId === memberId) ?? null;
  });
}

export function saveAccount(
  memberId: string,
  patch: Partial<
    Pick<Account, "email" | "passwordHash" | "notificationLastReadAt" | "dismissedNotificationIds">
  >,
) {
  return run(async () => {
    if (hasSupabaseEnv()) {
      const columns = await accountSelectColumns();
      const row: Record<string, unknown> = {};
      if (patch.email !== undefined) row.email = patch.email;
      if (patch.passwordHash !== undefined) row.password_hash = patch.passwordHash;
      if (accountNotifyReady !== false) {
        if (patch.notificationLastReadAt !== undefined) {
          row.notification_last_read_at = patch.notificationLastReadAt;
        }
        if (patch.dismissedNotificationIds !== undefined) {
          row.dismissed_notification_ids = patch.dismissedNotificationIds;
        }
      }

      const { data, error } = await getSupabase()
        .from("accounts")
        .update(row)
        .eq("member_id", memberId)
        .select(columns)
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

export function createAccount(input: Omit<Account, "passwordHash" | "dismissedNotificationIds"> & { password?: string }) {
  return run(async () => {
    const account: Account = {
      memberId: input.memberId,
      username: input.username.trim().toLowerCase(),
      email: input.email.trim().toLowerCase(),
      passwordHash: hashPassword(input.password ?? INITIAL_PASSWORD),
      dismissedNotificationIds: [],
    };

    if (hasSupabaseEnv()) {
      const columns = await accountSelectColumns();
      const insert: Record<string, unknown> = {
        member_id: account.memberId,
        username: account.username,
        email: account.email,
        password_hash: account.passwordHash,
      };
      if (accountNotifyReady !== false) {
        insert.dismissed_notification_ids = [];
      }
      const { data, error } = await getSupabase().from("accounts").insert(insert).select(columns).single();
      if (error) throw error;
      return mapAccount(data as unknown as Record<string, unknown>);
    }

    const rows = await readLocal();
    rows.push(account);
    await writeLocal(rows);
    return account;
  });
}
