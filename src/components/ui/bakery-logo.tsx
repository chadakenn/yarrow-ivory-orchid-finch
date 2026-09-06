import { cn } from "@/lib/utils";

export function BakeryLogo({
  className,
  size = "md",
  tone = "color",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  tone?: "color" | "brass";
}) {
  const mark = (
    <img src="/bakery-feeds.svg" alt="Bakery Feeds" className={cn(tone === "brass" && "bakery-mark", size)} />
  );
  if (tone === "brass") {
    return <span className={cn("bakery-lockup", size, className)}>{mark}</span>;
  }
  return <span className={cn("bakery-chip", size, className)}>{mark}</span>;
}
