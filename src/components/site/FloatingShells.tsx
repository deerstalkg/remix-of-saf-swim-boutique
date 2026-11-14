import { ShellMark } from "./ShellLogo";
import { cn } from "@/lib/utils";

const SHELLS = [
  { className: "left-[6%] top-[18%] h-10 w-10", r: "-18deg", delay: "0s" },
  { className: "right-[8%] top-[30%] h-14 w-14", r: "14deg", delay: "1.5s" },
  { className: "left-[18%] bottom-[14%] h-7 w-7", r: "8deg", delay: "3s" },
  { className: "right-[22%] bottom-[22%] h-9 w-9", r: "-10deg", delay: "4.5s" },
];

export function FloatingShells({ className, tone = "gold" }: { className?: string; tone?: "gold" | "ivory" | "ocean" }) {
  const color = tone === "gold" ? "text-gold/40" : tone === "ivory" ? "text-ivory/30" : "text-ocean/30";
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {SHELLS.map((s, i) => (
        <span
          key={i}
          className={cn("absolute animate-float", s.className, color)}
          style={{ ["--r" as string]: s.r, animationDelay: s.delay }}
        >
          <ShellMark className="h-full w-full" strokeWidth={1.6} />
        </span>
      ))}
    </div>
  );
}

/** Two layered drifting wave lines, used at the base of hero images. */
export function OceanWaves({ className }: { className?: string }) {
  const wave = "M0 30 Q 75 0 150 30 T 300 30 T 450 30 T 600 30 T 750 30 T 900 30 T 1050 30 T 1200 30 V60 H0 Z";
  return (
    <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden", className)} aria-hidden="true">
      <svg className="absolute bottom-0 h-full w-[200%] animate-wave-slow text-ivory/15" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d={wave} fill="currentColor" />
      </svg>
      <svg className="absolute -bottom-2 h-3/4 w-[200%] animate-wave text-ivory" viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d={wave} fill="currentColor" />
      </svg>
    </div>
  );
}
