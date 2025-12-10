import NextAuth, { type DefaultSession } from "next-auth";

import authConfig from "./auth.config";
import { getUserById } from "./getUserByEmail";
import { type UserRoleType, UserRole } from "@/db/models/UserModel";

type ExtendedUser = DefaultSession["user"] & {
  username: null | string
  role: UserRoleType
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.username = token.username as null | string
        session.user.email = token.email as string
        session.user.role = (token.role as UserRoleType) || UserRole.STUDENT
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub)
      if (!dbUser) {
        return token
      }

      token.username = dbUser.username || null
      token.role = dbUser.role || UserRole.STUDENT

      return token;
    },
  },
  ...authConfig
});

