import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[0.7rem] font-semibold uppercase tracking-[0.24em] cursor-pointer transition-all duration-500 ease-luxe focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-soft hover:bg-ocean hover:shadow-lift",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-primary/30 bg-transparent text-primary hover:border-primary hover:bg-primary hover:text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-sand",
        ghost: "hover:bg-secondary text-primary",
        link: "text-primary underline-offset-8 hover:underline normal-case tracking-normal text-sm font-medium",
        gold: "bg-gold text-pearl shadow-soft hover:bg-primary hover:shadow-lift",
        hero: "bg-ivory text-ocean-deep shadow-lift hover:bg-gold hover:text-pearl",
        heroOutline:
          "border border-ivory/70 bg-ivory/5 text-ivory backdrop-blur-sm hover:bg-ivory hover:text-ocean-deep",
        icon: "rounded-full text-primary hover:bg-secondary normal-case tracking-normal",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 px-6",
        lg: "h-14 px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
