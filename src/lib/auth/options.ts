import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import type { NextAuthOptions } from "next-auth";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const demoPassword = process.env.DEMO_PASSWORD ?? "demo123";

        if (password !== demoPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: `user-${email}`,
          email,
          name: email.split("@")[0] ?? "User",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? "";
      }
      return session;
    },
  },
  // Use the built-in NextAuth sign-in page for credentials.
  // For a custom page, change this to a React route like "/signin".
  // pages: {
  //   signIn: "/signin",
  // },
  secret: process.env.NEXTAUTH_SECRET,
};


