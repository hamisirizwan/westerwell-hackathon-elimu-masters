import type { NextAuthConfig } from "next-auth"
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { logInSchema } from "./logInSchema";
import { getUserByEmail } from "./getUserByEmail";

export default {
    providers: [
        credentials({
          credentials: {
            email: {},
            password: {},
          },
          authorize: async (credentials) => {
            try {
              const { email, password } = await logInSchema.parseAsync(credentials);
    
              const user: any = await getUserByEmail(email)
    
              if (!user || !user.password) {
                return null;
              }
    
              const isMatch = bcrypt.compareSync(
                password,
                user.password
              );
    
              if (!isMatch) {
                return null;
              }
    
              return user;
            } catch (error) {
              if (error instanceof ZodError) {
                return null;
              }
              return null;
            }
          },
        }),
      ],
} satisfies NextAuthConfig

