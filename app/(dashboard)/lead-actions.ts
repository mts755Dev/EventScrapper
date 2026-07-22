"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function revalidateLeadPaths(eventId: string) {
  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath("/leads");
  revalidatePath(`/events/${eventId}`);
}

export async function addToLead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ is_lead: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLeadPaths(id);
}

export async function removeFromLead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ is_lead: false, contacted: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLeadPaths(id);
}

export async function markLeadContacted(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .update({ contacted: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLeadPaths(id);
}

export async function deleteEvent(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const redirectTo = String(formData.get("redirect") ?? "/events");

  const supabase = await createClient();
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidateLeadPaths(id);
  redirect(redirectTo);
}
