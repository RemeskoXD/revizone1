import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      /** True when účet je zablokován (bannedAt) – klient by měl odhlásit. */
      blocked?: boolean
      /** Technik/firma – platnost oprávnění k revizím vypršela. */
      revisionAuthExpired?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
