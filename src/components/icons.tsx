type IconProps = { className?: string };

const NAVY = "var(--color-brand-dark)";
const SEA = "var(--color-brand)";
const SAND = "var(--color-secondary)";
const PAPER = "var(--color-canvas)";

function Mark({ className = "h-7 w-7", children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <rect x="4" y="7" width="24" height="21" rx="6" fill={NAVY} />
      <path d="M4 13h24v-1.2A5 5 0 0 0 23 7H9a5 5 0 0 0-5 4.8V13z" fill={SEA} />
      <rect x="10" y="4" width="2.6" height="6" rx="1.3" fill={SAND} />
      <rect x="19.4" y="4" width="2.6" height="6" rx="1.3" fill={SAND} />
      <circle cx="11" cy="18" r="1.45" fill={PAPER} />
      <circle cx="16" cy="18" r="1.45" fill={SAND} />
      <circle cx="21" cy="18" r="1.45" fill={PAPER} />
      <circle cx="11" cy="23" r="1.45" fill={PAPER} />
      <circle cx="16" cy="23" r="1.45" fill={PAPER} />
    </Mark>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <path d="M7 8.2A3.2 3.2 0 0 1 10.2 5H26v16.2H10.2A3.2 3.2 0 0 0 7 24.4V8.2z" fill={NAVY} />
      <path d="M7 24.2A3.2 3.2 0 0 1 10.2 21H26v6H10.2A3.2 3.2 0 0 1 7 23.8v.4z" fill={SEA} />
      <rect x="12" y="9" width="9" height="2" rx="1" fill={SAND} />
      <rect x="12" y="13" width="6.5" height="2" rx="1" fill={PAPER} opacity="0.85" />
      <path d="M23.2 5.4v7.2l-1.7-1.1-1.7 1.1V5.4" fill={SAND} />
    </Mark>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <path d="M16 3.2 27 7.4v7.4c0 6.3-4.3 11.8-11 13.8-6.7-2-11-7.5-11-13.8V7.4L16 3.2z" fill={NAVY} />
      <path d="M16 7.2 23.2 10v5.2c0 4.2-2.8 7.8-7.2 9.2-4.4-1.4-7.2-5-7.2-9.2V10L16 7.2z" fill={SEA} />
      <path
        d="m12.2 16.1 2.5 2.5 5.2-5.4"
        fill="none"
        stroke={SAND}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Mark>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <circle cx="21.2" cy="11.2" r="3.3" fill={SEA} />
      <path d="M15.6 25.6c.5-3.6 2.6-5.6 5.6-5.6s5.1 2 5.6 5.6" fill={SEA} />
      <circle cx="12.2" cy="12" r="4.1" fill={NAVY} />
      <path d="M4.4 26.4c.7-4.8 3.9-7.2 7.8-7.2s7.1 2.4 7.8 7.2" fill={NAVY} />
      <circle cx="12.2" cy="12" r="1.35" fill={SAND} />
    </Mark>
  );
}

export function TasksIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <rect x="6" y="4" width="20" height="24" rx="5" fill={NAVY} />
      <rect x="10" y="8.5" width="12" height="2.1" rx="1" fill={SAND} />
      <path
        d="m10 15.2 1.7 1.7 3.1-3.2M10 21.2l1.7 1.7 3.1-3.2"
        fill="none"
        stroke={SAND}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="17" y="14.6" width="5.5" height="1.8" rx="0.9" fill={PAPER} />
      <rect x="17" y="20.6" width="5.5" height="1.8" rx="0.9" fill={PAPER} />
    </Mark>
  );
}

export function BoxIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <path d="M16 4.5 27 10v12.2L16 27.6 5 22.2V10L16 4.5z" fill={NAVY} />
      <path d="M16 15.2 27 10 16 4.5 5 10l11 5.2z" fill={SEA} />
      <path d="M16 15.2v12.4" stroke={SAND} strokeWidth="2" strokeLinecap="round" />
      <path d="M16 15.2 5 10M16 15.2 27 10" stroke={PAPER} strokeWidth="1.2" opacity="0.55" />
    </Mark>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <path d="M5 14.2 16 5.2l11 9v11.2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14.2z" fill={NAVY} />
      <path d="M5 14.2 16 5.2l11 9H5z" fill={SEA} />
      <rect x="13" y="18" width="6" height="8.4" rx="1.2" fill={SAND} />
    </Mark>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <circle cx="16" cy="16" r="11" fill={NAVY} />
      <path d="M16 10.2v11.6M10.2 16h11.6" stroke={SAND} strokeWidth="2.2" strokeLinecap="round" />
    </Mark>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <circle cx="16" cy="16" r="11.2" fill={NAVY} />
      <circle cx="16" cy="16" r="8" fill={PAPER} />
      <path d="M16 10.6V16l3.6 2.2" fill="none" stroke={SEA} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="1.35" fill={SAND} />
    </Mark>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Mark {...props}>
      <path
        d="M16 4.2a1.5 1.5 0 0 1 1.5 1.5c3 .7 5.2 3.3 5.2 6.5v3.6l1.8 2.8a1.3 1.3 0 0 1-1.1 2H8.6a1.3 1.3 0 0 1-1.1-2l1.8-2.8v-3.6c0-3.2 2.2-5.8 5.2-6.5A1.5 1.5 0 0 1 16 4.2z"
        fill={NAVY}
      />
      <path d="M12.2 21.2a3.8 3.8 0 0 0 7.6 0" fill={SEA} />
      <circle cx="16" cy="23.6" r="1.7" fill={SAND} />
    </Mark>
  );
}
