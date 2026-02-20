import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { SupabaseAdapter } from "@auth/supabase-adapter";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!, // ここは必ず service_role を使用
  }),
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // 重要：ここでデータベース上の user.id をセッションに渡す
        session.user.id = user.id;
      }
      return session;
    },
  },
  // 開発中のエラーをターミナルに表示させる
  debug: true, 
});

export { handler as GET, handler as POST };