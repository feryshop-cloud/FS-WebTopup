import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { hasDatabaseConnection, sqlClient } from "@/lib/db";
import { signInSupabaseWithPassword } from "@/lib/supabase-auth";
import { logger } from "@/lib/logger";

if (!process.env.NEXTAUTH_SECRET) {
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
        (user as any).token = `FERY-GOOGLE-${Date.now()}`;
        (user as any).role = "member";
        (user as any).saldo = 50000;
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
  secret: process.env.NEXTAUTH_SECRET,
};
