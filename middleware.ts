import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // De root expliciet meenemen zodat de middleware ook "/" beschermt.
    "/",
    /*
     * Draai op alle paden behalve:
     * - _next/static (statische bestanden)
     * - _next/image (afbeeldingsoptimalisatie)
     * - favicon.ico en veelvoorkomende afbeeldingsformaten
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
