import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium disabled:opacity-50",
        variant === "primary" && "bg-accent text-white hover:opacity-90",
        variant === "ghost" && "text-ink hover:bg-canvas",
        className,
      )}
      {...props}
    />
  );
}
