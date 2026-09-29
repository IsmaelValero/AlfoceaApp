import { redirect } from "next/navigation";

import { EmailForm, PasswordForm } from "@/components/ProfileAccountForms";
import { ModuleTitle } from "@/components/ui";
import { findAccountByMember } from "@/lib/accounts";
import { getCurrentMember } from "@/lib/queries";
import { updateEmail, updatePassword } from "@/app/perfil/actions";

export const dynamic = "force-dynamic";

export default async function ProfileAccountPage() {
  const current = await getCurrentMember();
  if (!current) redirect("/login");

  const account = await findAccountByMember(current.member.id);

  return (
    <main className="screen">
      <ModuleTitle title="Cuenta" />
      <div className="space-y-3">
        <div className="card p-4">
          <EmailForm action={updateEmail} email={account?.email ?? current.member.email ?? ""} />
        </div>
        <div className="card p-4">
          <PasswordForm action={updatePassword} />
        </div>
      </div>
    </main>
  );
}
