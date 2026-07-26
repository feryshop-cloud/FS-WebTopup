import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

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

        if (!email) return null;

        let foundUser: any = null;

        // 1. Coba cari di Supabase / Drizzle DB
        if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
          try {
            const dbUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
            if (dbUsers && dbUsers[0]) {
              const u = dbUsers[0];
              foundUser = {
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role || "member",
                saldo: Number(u.balance || 0),
                whatsapp: u.whatsapp || "081234567890",
              };
            }
          } catch (e) {
            console.warn("Fallback auth DB lookup:", e);
          }
        }

        // 2. Fallback demo login jika DB tidak terkoneksi atau user baru saat dev
        if (!foundUser) {
          foundUser = {
            id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: email.split("@")[0].replace(/\b\w/g, (l) => l.toUpperCase()),
            email: email,
            role: "member",
            saldo: 50000,
            whatsapp: "081234567890",
          };
        }

        return {
          id: String(foundUser.id),
          name: foundUser.name,
          email: foundUser.email,
          token: `TSON-JWT-${Date.now()}`,
          role: foundUser.role,
          saldo: foundUser.saldo,
          whatsapp: foundUser.whatsapp,
        } as any;
      },
    }),

    CredentialsProvider({
      id: "otp",
      name: "OTP",
      credentials: {
        whatsapp: { label: "WhatsApp", type: "text" },
        otp: { label: "OTP", type: "text" },
        purpose: { label: "Purpose", type: "text" },
        name: { label: "Name", type: "text" },
        turnstile_token: { label: "Turnstile", type: "text" },
      },
      async authorize(credentials) {
        const whatsapp = typeof credentials?.whatsapp === "string" ? credentials.whatsapp.trim() : "";
        const name = typeof credentials?.name === "string" ? credentials.name : "Member Feryshop";

        if (!whatsapp) return null;

        let foundUser: any = null;

        if (process.env.DATABASE_URL || process.env.SUPABASE_DB_URL) {
          try {
            const dbUsers = await db.select().from(users).where(eq(users.whatsapp, whatsapp)).limit(1);
            if (dbUsers && dbUsers[0]) {
              const u = dbUsers[0];
              foundUser = {
                id: u.id,
                name: u.name,
                email: u.email || `${whatsapp}@feryshop.id`,
                role: u.role || "member",
                saldo: Number(u.balance || 0),
                whatsapp: u.whatsapp || whatsapp,
              };
            }
          } catch (e) {
            console.warn("Fallback OTP DB lookup:", e);
          }
        }

        if (!foundUser) {
          foundUser = {
            id: `USR-${whatsapp.slice(-4)}`,
            name: name,
            email: `${whatsapp}@feryshop.id`,
            role: "member",
            saldo: 50000,
            whatsapp: whatsapp,
          };
        }

        return {
          id: String(foundUser.id),
          name: foundUser.name,
          email: foundUser.email,
          token: `FERY-JWT-${Date.now()}`,
          role: foundUser.role,
          saldo: foundUser.saldo,
          whatsapp: foundUser.whatsapp,
        } as any;
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        (user as any).token = `FERY-GOOGLE-${Date.now()}`;
        (user as any).role = "member";
        (user as any).saldo = 50000;
        (user as any).whatsapp = "081234567890";
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        (token as any).jwtToken = (user as any).token;
        (token as any).role = (user as any).role ?? null;
        (token as any).saldo = (user as any).saldo ?? null;
        (token as any).whatsapp = (user as any).whatsapp ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).token = typeof (token as any).jwtToken === "string" ? (token as any).jwtToken : undefined;
        (session.user as any).role = (token as any).role ?? null;
        (session.user as any).saldo = (token as any).saldo ?? null;
        (session.user as any).whatsapp = (token as any).whatsapp ?? null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "feryshop-super-secret-key-2026",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };