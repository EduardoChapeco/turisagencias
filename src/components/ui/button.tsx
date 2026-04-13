import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[100px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--green)] text-white hover:bg-[var(--green)]/90 border-none shadow-sm",
        destructive: "bg-[var(--red)] text-white hover:bg-[var(--red)]/90 shadow-sm",
        outline: "border border-[var(--border2)] bg-transparent text-[var(--txt)] hover:bg-[var(--bg)]",
        secondary: "bg-[var(--bg)] text-[var(--txt)] hover:bg-[var(--border)]",
        ghost: "bg-transparent text-[var(--green)] hover:underline shadow-none",
        link: "text-[var(--blue)] underline-offset-4 hover:underline shadow-none",
        dark: "bg-[var(--txt)] text-white hover:bg-black border-none",
        dangerGhost: "bg-transparent border border-[var(--red)] text-[var(--red)] hover:bg-[var(--red-bg)]",
      },
      size: {
        default: "px-[16px] py-[7px] text-[12px]",
        sm: "px-[10px] py-[4px] text-[11px]",
        lg: "px-[20px] py-[10px] text-[13px]",
        icon: "h-9 w-9",
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
