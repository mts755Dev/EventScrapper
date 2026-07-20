"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function DashboardSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = q.trim();
    if (!value) {
      router.push("/events");
      return;
    }
    router.push(`/events?q=${encodeURIComponent(value)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events…"
        className="pl-9"
        aria-label="Search events"
      />
    </form>
  );
}
