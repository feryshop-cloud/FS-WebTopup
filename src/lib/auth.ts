import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, hasDatabaseConnection, sqlClient } from "@/lib/db";
import { signInSupabaseWithPassword } from "@/lib/supabase-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
    }),

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
          const profiles = await sqlClient<{ id: string; full_name: string; email: string; status: string }[]>`
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
          console.warn("Credentials auth failed:", e);
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
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).token = typeof (token as any).jwtToken === "string" ? (token as any).jwtToken : undefined;
        (session.user as any).role = (token as any).role ?? null;
        (session.user as any).saldo = (token as any).saldo ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "feryshop-super-secret-key-2026",
};

