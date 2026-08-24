import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-line bg-surface px-3 py-2 text-sm",
        "focus:border-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
