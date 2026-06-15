"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AuthState } from "@/lib/actions/auth-types";

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Vul je e-mailadres en wachtwoord in." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Inloggen mislukt. Controleer je e-mailadres en wachtwoord." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!displayName || !email || !password) {
    return { error: "Vul je naam, e-mailadres en wachtwoord in." };
  }
  if (password.length < 6) {
    return { error: "Je wachtwoord moet minstens 6 tekens lang zijn." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // display_name wordt door de database-trigger opgepikt en in de
      // profiles-rij gezet.
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Staat e-mailbevestiging aan, dan is er nog geen sessie. Stuur de
  // gebruiker terug naar de loginpagina met een melding.
  if (!data.session) {
    redirect("/login?message=confirm-email");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
