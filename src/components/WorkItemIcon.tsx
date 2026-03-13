function IconRoad({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M9 2h6l-1.5 8H17l-1 6h2.4L16 22H8l2.4-6H8l1-6h3.5L9 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSchool({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M3 9 12 4l9 5-9 5-9-5Zm2 2.1V17a2 2 0 0 0 1.1 1.8L12 22l5.9-3.2A2 2 0 0 0 19 17v-5.9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLeaf({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M20 4c-7 0-14 4-14 11a5 5 0 0 0 8 4c3-2.2 4.3-5.5 4.7-9.3.2-1.9.3-3.8.3-5.7ZM4 20c2.5-2.7 5.3-4.9 9-6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconHealth({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.6-7 10-7 10Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 9v4M10 11h4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconDefault({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const iconMap: Record<string, (props: { className: string }) => ReactElement> = {
  road: IconRoad,
  school: IconSchool,
  leaf: IconLeaf,
  health: IconHealth
};

export function WorkItemIcon({ iconKey, className = "h-5 w-5" }: { iconKey: string; className?: string }) {
  const Icon = iconMap[iconKey] || IconDefault;
  return <Icon className={className} />;
}
import type { ReactElement } from "react";
