import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { hasDatabaseConnection, sqlClient } from "@/lib/db";
import { signInSupabaseWithPassword } from "@/lib/supabase-auth";
import { logger } from "@/lib/logger";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const ALLOW_BUILD_WITHOUT_SECRET = process.env.NEXTAUTH_SECRET_ALLOW_BUILD_WITHOUT === "true";

if (!NEXTAUTH_SECRET && !ALLOW_BUILD_WITHOUT_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Set it before starting the app (see .env.local or Railway Variables).",
  );
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!!googleClientId !== !!googleClientSecret) {
  throw new Error(
    "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both be set to enable Google sign-in.",
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        turnstile_token: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password || !hasDatabaseConnection) return null;

        try {
          const authUser = await signInSupabaseWithPassword(email, password);
          const profiles = await sqlClient<
            { id: string; full_name: string; email: string; status: string }[]
          >`
            select id, full_name, email, status
            from public.users
            where id = ${authUser.id}
            limit 1
          `;
          const profile = profiles[0];
          if (!profile) return null;

          return {
            id: String(profile.id),
            name: profile.full_name,
            email: profile.email,
            token: `TSON-JWT-${Date.now()}`,
            role: "member",
            saldo: 0,
          } as any;
        } catch (e) {
          logger.warn("Credentials auth failed", { error: e });
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!hasDatabaseConnection) return false;

        const email = user.email;
        if (!email) return false;

        try {
          // Cek apakah user sudah ada di public.users
          let dbUser = await sqlClient<{ id: string; role_name: string; balance: number }[]>`
            SELECT u.id, r.name as role_name, u.balance
            FROM public.users u
            LEFT JOIN public.roles r ON u.role_id = r.id
            WHERE u.email = ${email}
            LIMIT 1
          `;

          let finalUserId = dbUser[0]?.id;
          let role = dbUser[0]?.role_name || "member";
          let saldo = dbUser[0]?.balance || 0;

          if (!finalUserId) {
            // Cek apakah user sudah ada di auth.users (tapi belum di public.users)
            const authCheck = await sqlClient<{ id: string }[]>`
              SELECT id FROM auth.users WHERE email = ${email} LIMIT 1
            `;
            let authUserId = authCheck[0]?.id;

            if (!authUserId) {
              // Buat akun di auth.users menggunakan API Admin
              const { createSupabaseAuthUser } = await import("@/lib/supabase-auth");
              const randomPassword = "GGL-" + Math.random().toString(36).slice(-10) + "A1!";
              const newAuthUser = await createSupabaseAuthUser({
                email,
                password: randomPassword,
                name: user.name || "Google User",
              });
              authUserId = newAuthUser.id;
            }

            // Insert ke public.users agar sinkron dan relasinya valid
            await sqlClient`
              INSERT INTO public.users (id, full_name, email, balance, status)
              VALUES (${authUserId}, ${user.name || "Google User"}, ${email}, 0, 'Aktif')
              ON CONFLICT (id) DO NOTHING
            `;
            finalUserId = authUserId;
          }

          // Suntikkan data asli dari database ke session NextAuth
          user.id = String(finalUserId);
          (user as any).token = `FERY-GOOGLE-${Date.now()}`;
          (user as any).role = role ? role.toLowerCase() : "member";
          (user as any).saldo = Number(saldo);

          return true;
        } catch (error) {
          logger.error("Google Auth Sync Error", { error });
          return false; // Tolak login jika gagal sinkronisasi
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        (token as any).jwtToken = (user as any).token;
        (token as any).role = (user as any).role ?? null;
        (token as any).saldo = (user as any).saldo ?? null;
        if (typeof (user as any).id !== "undefined") {
          (token as any).userId = (user as any).id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).token =
          typeof (token as any).jwtToken === "string" ? (token as any).jwtToken : undefined;
        (session.user as any).role = (token as any).role ?? null;
        (session.user as any).saldo = (token as any).saldo ?? null;
        if (typeof (token as any).userId !== "undefined") {
          (session.user as any).id = (token as any).userId;
        } else if (typeof (token as any).sub !== "undefined") {
          (session.user as any).id = (token as any).sub;
        }
      }
      return session;
    },
  },
  secret: NEXTAUTH_SECRET,
};
