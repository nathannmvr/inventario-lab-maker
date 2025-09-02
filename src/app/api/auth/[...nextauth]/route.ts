import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { kv } from "@vercel/kv";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) {
        return false;
      }

      // O primeiro administrador é definido via variável de ambiente
      if (user.email === process.env.FIRST_ADMIN_EMAIL) {
        // Aproveita para adicioná-lo ao KV, caso ainda não esteja lá
        await kv.sadd("admins", user.email);
        return true;
      }

      // Verifica se o email do usuário está na lista de admins no KV
      const isAdmin = await kv.sismember("admins", user.email);
      if (isAdmin) {
        return true;
      }

      return false; // Bloqueia o login se não for admin
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };