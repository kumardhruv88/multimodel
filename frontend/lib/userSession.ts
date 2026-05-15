/**
 * Returns a stable user ID for the current session.
 * - If signed in via Clerk: returns the Clerk userId.
 * - If anonymous (free user): generates and persists a unique
 *   anonymous session ID in localStorage so their chats stay private.
 */
export function getEffectiveUserId(clerkUserId: string | null | undefined): string {
  if (clerkUserId) {
    return clerkUserId;
  }

  // For anonymous users, generate a persistent session ID
  const ANON_KEY = "nexus_anon_uid";
  try {
    let anonId = localStorage.getItem(ANON_KEY);
    if (!anonId) {
      anonId = "anon_" + crypto.randomUUID();
      localStorage.setItem(ANON_KEY, anonId);
    }
    return anonId;
  } catch {
    // localStorage unavailable (SSR or private browsing fallback)
    return "anon_fallback";
  }
}
