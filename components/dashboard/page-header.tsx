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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
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
      <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
        No records found.
      </div>
    );
  }

  return (
    <div className={cn("w-full rounded-lg border", className)}>
      <table className="w-full table-auto text-left text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-3 py-2.5 font-medium break-words text-muted-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  );
}
