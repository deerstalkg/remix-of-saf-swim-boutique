import { cn } from "@/lib/utils";

// Scallop shell geometry (deterministic, computed once).
const CX = 50;
const CY = 82;
const R = 40;
const SEGMENTS = 7;
const START = 165;
const END = 15;

function pt(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return [CX + radius * Math.cos(a), CY - radius * Math.sin(a)] as const;
}

const step = (START - END) / SEGMENTS;
const edge: string[] = [];
const ribs: string[] = [];
for (let i = 0; i <= SEGMENTS; i++) {
  const [x, y] = pt(START - i * step, R);
  if (i === 0) edge.push(`M${CX - 7} 90 L${x.toFixed(2)} ${y.toFixed(2)}`);
  else {
    const [qx, qy] = pt(START - (i - 0.5) * step, R + 8);
    edge.push(`Q${qx.toFixed(2)} ${qy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  if (i > 0) {
    const [rx, ry] = pt(START - (i - 0.5) * step, R + 4);
    ribs.push(`M${CX} 86 L${rx.toFixed(2)} ${ry.toFixed(2)}`);
  }
}
edge.push(`L${CX + 7} 90 Z`);
const EDGE = edge.join(" ");
const RIBS = ribs.join(" ");

export function ShellMark({ className, strokeWidth = 2.2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 100 100" className={cn("h-8 w-8", className)} fill="none" aria-hidden="true">
      <path d={EDGE} stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
      <path d={RIBS} stroke="currentColor" strokeWidth={strokeWidth * 0.6} strokeLinecap="round" />
      <path d={`M${CX - 12} 94 L${CX - 6} 86 L${CX + 6} 86 L${CX + 12} 94 Z`} stroke="currentColor" strokeWidth={strokeWidth * 0.8} strokeLinejoin="round" />
    </svg>
  );
}

export function ShellLogo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", light ? "text-ivory" : "text-primary", className)}>
      <ShellMark className="h-9 w-9 text-gold" />
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.45rem] font-medium tracking-[0.18em]">SAF SWIM</span>
        <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.5em] opacity-80">by Summer</span>
      </span>
    </span>
  );
}
