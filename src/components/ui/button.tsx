import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-vj-green text-white hover:bg-vj-green/90 border-none shadow-none",
        destructive: "bg-vj-red text-white hover:bg-vj-red/90 border-none shadow-none",
        outline: "border border-vj-border bg-white text-vj-txt hover:bg-zinc-50 shadow-none",
        secondary: "bg-zinc-100 text-vj-txt hover:bg-zinc-200 border-none shadow-none",
        ghost: "bg-transparent text-vj-green hover:bg-vj-green/5 border-none shadow-none",
        link: "text-vj-blue underline-offset-4 hover:underline border-none shadow-none",
        dark: "bg-vj-bg-dark text-white hover:bg-black border-none shadow-none",
        dangerGhost: "bg-transparent border border-vj-red text-vj-red hover:bg-vj-red-bg shadow-none",
      },
      size: {
        default: "h-11 px-6 text-[12px] uppercase tracking-widest font-black",
        sm: "h-9 px-4 text-[11px] uppercase tracking-wider font-bold",
        lg: "h-12 px-8 text-[13px] uppercase tracking-widest font-black",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
