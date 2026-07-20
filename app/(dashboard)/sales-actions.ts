"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Disposition } from "@/types/database";

function revalidateSalesPaths(entity: "event" | "organization", id: string) {
  revalidatePath("/events");
  revalidatePath("/events/calendar");
  revalidatePath("/organizations");
  revalidatePath("/");
  if (entity === "event") {
    revalidatePath(`/events/${id}`);
  } else {
    revalidatePath(`/organizations/${id}`);
  }
}

export async function setEventContacted(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const contacted = String(formData.get("contacted") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ contacted: !contacted })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateSalesPaths("event", id);
}

export async function setEventDisposition(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const disposition = String(formData.get("disposition") ?? "") as Disposition;
  if (!id) return;
  if (!["none", "accepted", "declined"].includes(disposition)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ disposition })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateSalesPaths("event", id);
}

export async function setOrganizationContacted(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const contacted = String(formData.get("contacted") ?? "") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ contacted: !contacted })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateSalesPaths("organization", id);
}

export async function setOrganizationDisposition(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const disposition = String(formData.get("disposition") ?? "") as Disposition;
  if (!id) return;
  if (!["none", "accepted", "declined"].includes(disposition)) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ disposition })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateSalesPaths("organization", id);
}
