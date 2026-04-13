import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[42px] w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-[13px] text-[var(--txt)] transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[var(--txt3)] focus-visible:outline-none focus-visible:border-[var(--green)] focus-visible:ring-1 focus-visible:ring-[var(--green)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--bg)]",
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
