import { Badge, type BadgeTone } from "@/components/ui";
import type { RulePriority } from "@/lib/types";

export const PRIORITY_TONE: Record<RulePriority, BadgeTone> = {
  alta: "danger",
  media: "warn",
  baja: "neutral",
};

export const PRIORITY_LABEL: Record<RulePriority, string> = {
  alta: "Prioridad alta",
  media: "Prioridad media",
  baja: "Recomendacion",
};

export function RulePriorityBadge({ priority }: { priority: RulePriority }) {
  return <Badge tone={PRIORITY_TONE[priority]}>{PRIORITY_LABEL[priority]}</Badge>;
}
