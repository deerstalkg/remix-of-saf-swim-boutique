import type { ReactNode } from "react";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function PageHeading({ eyebrow, title, children, className }: { eyebrow: string; title: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-[1500px] px-6 pb-12 pt-16 md:px-10 md:pt-24", className)}>
      <Reveal>
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="display-lg mt-4">{title}</h1>
        {children && <div className="mt-5 max-w-xl text-muted-foreground">{children}</div>}
      </Reveal>
    </div>
  );
}
