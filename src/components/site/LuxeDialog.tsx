import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function LuxeDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  hideTitle = true,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  hideTitle?: boolean;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[calc(100%-1.5rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-background shadow-lift duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            className,
          )}
        >
          <DialogPrimitive.Title className={hideTitle ? "sr-only" : "font-serif text-3xl"}>{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description ?? title}</DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close
            className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-primary backdrop-blur transition hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
