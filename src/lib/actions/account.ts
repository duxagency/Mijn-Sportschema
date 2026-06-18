"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AccountState } from "./account-types";

export async function updateDisplayName(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const name = String(formData.get("display_name") ?? "").trim();
  if (!name) {
    return { error: "Geef een naam op.", success: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Je bent niet (meer) ingelogd.", success: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name })
    .eq("id", user.id);

  if (error) {
    return { error: "Opslaan mislukt. Probeer het opnieuw.", success: null };
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { error: null, success: "Naam bijgewerkt." };
}

export async function updatePassword(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 6) {
    return {
      error: "Je wachtwoord moet minstens 6 tekens lang zijn.",
      success: null,
    };
  }
  if (password !== confirm) {
    return { error: "De wachtwoorden komen niet overeen.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      error: "Wachtwoord wijzigen mislukt. Probeer het opnieuw.",
      success: null,
    };
  }

  return { error: null, success: "Wachtwoord bijgewerkt." };
}

export async function updateEmail(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Vul een e-mailadres in.", success: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email });
  if (error) {
    return {
      error: "E-mailadres wijzigen mislukt. Probeer het opnieuw.",
      success: null,
    };
  }

  return {
    error: null,
    success:
      "Check de inbox van je nieuwe e-mailadres om de wijziging te bevestigen.",
  };
}

export async function deleteAccount(
  _prev: AccountState,
  _formData: FormData,
): Promise<AccountState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_user");
  if (error) {
    return {
      error: "Account verwijderen mislukt. Probeer het opnieuw.",
      success: null,
    };
  }

  await supabase.auth.signOut();
  redirect("/login");
}
