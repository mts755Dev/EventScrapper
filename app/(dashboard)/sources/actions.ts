"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleSourceActive(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  if (!id) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("sources")
    .update({ active: !active })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/sources");
  revalidatePath("/");
}
