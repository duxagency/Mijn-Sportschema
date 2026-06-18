import { APP_VERSION } from "@/lib/version";

/**
 * Klein versielabel. Toont het handmatige versienummer plus het korte
 * commit-hash van de huidige Vercel-deploy (lokaal: "lokaal").
 */
export function AppVersion() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const build = sha ? sha.slice(0, 7) : "lokaal";

  return (
    <p className="mt-8 text-center text-xs text-neutral-600">
      v{APP_VERSION} · {build}
    </p>
  );
}
