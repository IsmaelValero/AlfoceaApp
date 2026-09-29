import { redirect } from "next/navigation";

import { AppearanceSetting } from "@/components/AppearanceSetting";
import { ModuleTitle } from "@/components/ui";
import { getCurrentMember } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProfileStylesPage() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");

  return (
    <main className="screen">
      <ModuleTitle title="Estilos" />
      <div className="card p-4">
        <AppearanceSetting />
      </div>
    </main>
  );
}
