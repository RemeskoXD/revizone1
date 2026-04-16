import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { getNextAuthJwtSecret } from "./jwt-secret";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Neplatné přihlašovací údaje");
        }

        type UserAuth = {
          id: string;
          email: string | null;
          name: string | null;
          password: string | null;
          role: string;
          // Optional, until DB is migrated. When selected, it will be present.
          isDeleted?: boolean;
        };

        // Important: some DBs may still not have `User.isDeleted` column yet.
        // We try to select it first, and fall back to a query without it to keep login working.
        let user: UserAuth | null = null;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              isDeleted: true,
            },
          });
        } catch {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
            },
          });
        }

        if (!user || !user.password) {
          throw new Error("Uživatel nenalezen");
        }

        const isDeleted = (user as any)?.isDeleted === true;
        if (isDeleted) {
          throw new Error("Účet byl deaktivován");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error("Nesprávné heslo");
        }

        if (user.role === 'PENDING_SUPPORT' || user.role === 'PENDING_CONTRACTOR') {
          throw new Error("Váš účet čeká na schválení administrátorem");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    callbackUrl: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
    csrfToken: {
      name: process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
      },
    },
  },
  secret: getNextAuthJwtSecret(),
};
