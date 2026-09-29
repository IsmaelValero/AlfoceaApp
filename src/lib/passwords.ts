import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const BOOTSTRAP_PREFIX = "$bootstrap$";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

/** Marca especial del seed SQL: la primera vez que se entra, se sustituye por un hash real. */
export function bootstrapPasswordMarker(password: string) {
  return `${BOOTSTRAP_PREFIX}${password}`;
}

export function isBootstrapHash(stored: string) {
  return stored.startsWith(BOOTSTRAP_PREFIX);
}

export function bootstrapPlainPassword(stored: string) {
  return stored.slice(BOOTSTRAP_PREFIX.length);
}

export function verifyPassword(password: string, stored: string) {
  if (isBootstrapHash(stored)) {
    return password === bootstrapPlainPassword(stored);
  }

  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32);
  const previous = Buffer.from(hash, "hex");
  if (next.length !== previous.length) return false;
  return timingSafeEqual(next, previous);
}
