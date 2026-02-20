import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      /** ユーザーの固有ID */
      id: string;
    } & DefaultSession["user"];
  }
}