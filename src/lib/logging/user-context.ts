import { getToken } from "next-auth/jwt";

function cookieMapFromHeaders(headers: Headers): Map<string, string> {
  const map = new Map<string, string>();
  const cookie = headers.get("cookie");
  if (!cookie) return map;
  for (const part of cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (name) map.set(name, value);
  }
  return map;
}

/**
 * Derive `{ id }` of the authenticated user from the request headers (session
 * cookie). Returns `undefined` when unauthenticated or the token cannot be
 * decoded — never throws.
 */
export async function userFromRequest(
  headers: Headers | Record<string, string | string[] | undefined> | unknown,
): Promise<{ id: string } | undefined> {
  let headersObj: Headers;
  if (headers instanceof Headers) {
    headersObj = headers;
  } else if (headers && typeof headers === "object") {
    headersObj = new Headers();
    const record = headers as Record<string, string | string[] | undefined>;
    for (const [key, value] of Object.entries(record)) {
      if (value === undefined) continue;
      headersObj.set(key, Array.isArray(value) ? (value[0] ?? "") : value);
    }
  } else {
    return undefined;
  }

  try {
    const token = await getToken({
      req: {
        cookies: cookieMapFromHeaders(headersObj),
        headers: headersObj,
      } as unknown as Parameters<typeof getToken>[0]["req"],
      secret: process.env.NEXTAUTH_SECRET,
    });
    const id =
      (token as { userId?: string; sub?: string } | null)?.userId ??
      (token as { userId?: string; sub?: string } | null)?.sub;
    return id ? { id: String(id) } : undefined;
  } catch {
    return undefined;
  }
}
