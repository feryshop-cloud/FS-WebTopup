type SupabaseAuthUser = {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabaseAuthResponse = {
  user?: SupabaseAuthUser;
  error?: string;
  error_description?: string;
  msg?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSupabaseUrl() {
  const candidates = [
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_DB_URL,
    process.env.DATABASE_URL,
  ];

  return trimTrailingSlash(candidates.find((value) => value?.startsWith("http")) || "");
}

function getPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";
}

function authErrorMessage(payload: SupabaseAuthResponse, fallback: string) {
  return payload.error_description || payload.msg || payload.error || fallback;
}

async function parseAuthResponse(response: Response) {
  return (await response.json().catch(() => ({}))) as SupabaseAuthResponse;
}

export async function createSupabaseAuthUser(input: {
  email: string;
  password: string;
  name: string;
}) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diset untuk membuat auth.users",
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        name: input.name,
        full_name: input.name,
      },
    }),
  });

  const payload = await parseAuthResponse(response);
  if (!response.ok || !payload.user?.id) {
    throw new Error(authErrorMessage(payload, "Gagal membuat user Supabase Auth"));
  }

  return payload.user;
}

export async function deleteSupabaseAuthUser(userId: string) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) return;

  await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  }).catch(() => undefined);
}

export async function signInSupabaseWithPassword(email: string, password: string) {
  const supabaseUrl = getSupabaseUrl();
  const publishableKey = getPublishableKey();

  if (!supabaseUrl || !publishableKey) {
    throw new Error(
      "SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY wajib diset untuk login",
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const payload = await parseAuthResponse(response);
  if (!response.ok || !payload.user?.id) {
    throw new Error(authErrorMessage(payload, "Email atau password salah"));
  }

  return payload.user;
}

export async function updateSupabaseAuthPassword(userId: string, password: string) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getServiceRoleKey();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diset untuk mengubah password",
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
    method: "PUT",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  const payload = await parseAuthResponse(response);
  if (!response.ok) {
    throw new Error(authErrorMessage(payload, "Gagal mengubah password Supabase Auth"));
  }
}
