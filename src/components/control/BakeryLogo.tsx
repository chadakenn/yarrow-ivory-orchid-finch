import { cn } from "@/lib/utils";

export function BakeryLogo({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <span className={cn("bakery-chip", size, className)}>
      <img src="/bakery-feeds.svg" alt="Bakery Feeds" />
    </span>
  );
}
