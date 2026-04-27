import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-vj-border bg-white px-4 py-2 text-sm text-vj-txt transition-all placeholder:text-vj-txt3/60 focus-visible:outline-none focus-visible:border-vj-green/50 focus-visible:ring-4 focus-visible:ring-vj-green/5 disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-50 font-medium",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
