import { NextResponse } from "next/server";

import { getSupabase, getSupabaseConfig, hasSupabaseEnv } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/** Diagnostico de conexion a Supabase (sin secretos). */
export async function GET() {
  const result: Record<string, unknown> = {
    hasEnv: hasSupabaseEnv(),
    vercel: Boolean(process.env.VERCEL),
    nodeEnv: process.env.NODE_ENV,
  };

  try {
    const { url, key } = getSupabaseConfig();
    result.url = url;
    result.keyPrefix = `${key.slice(0, 6)}...`;
    result.keyLength = key.length;

    const { data, error } = await getSupabase().from("families").select("id,name").limit(1);
    if (error) {
      result.db = "error";
      result.dbMessage = error.message;
      result.dbCode = error.code;
    } else {
      result.db = "ok";
      result.familiesSample = data?.length ?? 0;
    }
  } catch (error) {
    result.configError = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(result);
}
