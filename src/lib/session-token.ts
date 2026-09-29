export const SESSION_COOKIE = "alfocea_session";

const SECRET = process.env.ALFOCEA_SESSION_SECRET ?? "alfocea-local-session-v1";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function textToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToText(value: string) {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function sign(body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signSession(memberId: string) {
  const body = textToBase64Url(JSON.stringify({ memberId }));
  return `${body}.${await sign(body)}`;
}

export async function readSession(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (!safeEqual(signature, await sign(body))) return null;
  try {
    const parsed = JSON.parse(base64UrlToText(body)) as { memberId?: string };
    return parsed.memberId || null;
  } catch {
    return null;
  }
}
