import Link from "next/link";

import { BUTTON_STYLES } from "@/components/ui";

export function AdminCreateLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="mb-4">
      <Link href={href} className={`${BUTTON_STYLES.primary} w-full`}>
        {label}
      </Link>
    </div>
  );
}

export function AdminEditLink({ href, label = "Editar" }: { href: string; label?: string }) {
  return (
    <Link href={href} className={`${BUTTON_STYLES.secondary} w-full`}>
      {label}
    </Link>
  );
}
