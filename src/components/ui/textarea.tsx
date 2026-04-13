import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-[10px] border border-[var(--border)] bg-white px-3 py-2 text-[13px] text-[var(--txt)] transition-colors placeholder:text-[var(--txt3)] focus-visible:outline-none focus-visible:border-[var(--green)] focus-visible:ring-1 focus-visible:ring-[var(--green)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--bg)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
