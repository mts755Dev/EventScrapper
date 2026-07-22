import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-primary text-white dark:bg-primary/70 dark:text-white",
        variant === "success" && "bg-emerald-600 text-white dark:bg-emerald-700/80 dark:text-emerald-100",
        variant === "warning" && "bg-amber-500 text-white dark:bg-amber-600/70 dark:text-amber-100",
        variant === "destructive" && "bg-red-600 text-white dark:bg-red-700/80 dark:text-red-100",
        variant === "outline" && "bg-secondary text-foreground ring-1 ring-inset ring-border",
        className
      )}
    >
      {children}
    </span>
  );
}
