import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/authz";
import { buildDiagnostics } from "@/lib/diagnostics";

export const dynamic = "force-dynamic";

/** Diagnostico de conexion. Solo administradores. */
export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  return NextResponse.json(await buildDiagnostics());
}
