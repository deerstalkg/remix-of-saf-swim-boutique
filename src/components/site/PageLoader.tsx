import { ShellMark } from "./ShellLogo";

/** Pure-CSS intro veil: fades itself out, never blocks clicks. */
export function PageLoader() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-background animate-loader-out" aria-hidden="true">
      <div className="flex flex-col items-center animate-loader-shell">
        <ShellMark className="h-16 w-16 text-gold" strokeWidth={1.6} />
        <p className="mt-5 font-serif text-2xl tracking-[0.3em] text-primary">SAF SWIM</p>
      </div>
    </div>
  );
}
