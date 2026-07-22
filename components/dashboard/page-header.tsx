import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function DataTable({
  headers,
  children,
  empty,
  className,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: boolean;
  className?: string;
}) {
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        No records found.
      </div>
    );
  }

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border bg-card shadow-sm", className)}>
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
