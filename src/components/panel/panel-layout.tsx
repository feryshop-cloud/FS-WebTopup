"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";
import { Footer } from "@/components/panel/footer";
import { WhatsAppBubble } from "@/components/panel/whatsapp-bubble";

export default function PanelLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <div className="mx-auto w-full max-w-5xl">
        <main>{children}</main>
        <footer>
          <Footer />
        </footer>
      </div>
      <WhatsAppBubble />
    </SessionProvider>
  );
}
