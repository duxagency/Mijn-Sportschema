import { redirect } from "next/navigation";

// De middleware stuurt niet-ingelogde bezoekers door naar /login.
// Ingelogde bezoekers landen op hun dashboard.
export default function Home() {
  redirect("/dashboard");
}
