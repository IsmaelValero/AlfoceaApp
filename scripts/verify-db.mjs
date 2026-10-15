import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
for (const line of env.split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const headers = { apikey: key, Authorization: `Bearer ${key}` };

async function check(path, label) {
  const response = await fetch(`${url}/rest/v1/${path}`, { headers });
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  const ok = response.ok;
  const count = Array.isArray(body) ? body.length : null;
  console.log(JSON.stringify({ label, status: response.status, ok, count, sample: Array.isArray(body) ? body.slice(0, 2) : body }));
  return ok;
}

const tables = [
  ["families?select=id&limit=2", "families"],
  ["members?select=id,name,birth_day,birth_month&limit=3", "members"],
  ["polls?select=id,month,status&limit=5", "polls"],
  ["poll_options?select=id,label&limit=3", "poll_options"],
  ["events?select=id,title&limit=3", "events"],
  ["event_rsvps?select=id&limit=1", "event_rsvps"],
  ["event_items?select=id&limit=1", "event_items"],
  ["projects?select=id&limit=1", "projects"],
  ["recurring_completions?select=id&limit=1", "recurring_completions"],
];

let failed = 0;
for (const [path, label] of tables) {
  const ok = await check(path, label);
  if (!ok) failed += 1;
}

// Anon key should be denied if RLS is on and no policies (if anon key not in env, skip).
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
if (anon) {
  const response = await fetch(`${url}/rest/v1/families?select=id&limit=1`, {
    headers: { apikey: anon, Authorization: `Bearer ${anon}` },
  });
  console.log(JSON.stringify({ label: "anon-families", status: response.status, denied: response.status === 401 || response.status === 403 }));
} else {
  console.log(JSON.stringify({ label: "anon-check", skipped: true }));
}

process.exit(failed ? 1 : 0);
