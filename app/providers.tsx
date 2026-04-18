"use client";

import { SessionProvider } from "next-auth/react";
import { RevizoneRoleChrome } from "@/components/RevizoneRoleChrome";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RevizoneRoleChrome />
      {children}
    </SessionProvider>
  );
}
