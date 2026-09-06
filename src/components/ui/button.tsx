import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  asChild?: boolean;
};

export function Button({ className, variant = "primary", size = "md", asChild, ...props }: Props) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium tracking-tight transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)] disabled:opacity-50",
        size === "sm" ? "h-9 px-3 text-sm" : "h-11 px-4 text-sm",
        variant === "primary" && "bg-accent text-accent-fg hover:opacity-90 active:scale-[0.98]",
        variant === "secondary" && "border border-border bg-elevated text-fg hover:bg-surface",
        variant === "ghost" && "text-muted hover:bg-elevated hover:text-fg",
        variant === "danger" && "bg-danger text-white hover:opacity-90",
        className,
      )}
      {...props}
    />
  );
}
