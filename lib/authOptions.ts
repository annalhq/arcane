import { NextAuthOptions, getServerSession } from "next-auth";
import { DefaultSession } from "next-auth";
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

// Extend the default session types to include user.id
declare module "next-auth" {
     interface Session {
          user: {
               id: string;
          } & DefaultSession["user"]
     }
}

export const authOptions: NextAuthOptions = {
     providers: [
          GoogleProvider({
               clientId: process.env.GOOGLE_CLIENT_ID!,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
          GithubProvider({
               clientId: process.env.GITHUB_CLIENT_ID!,
               clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
     ],
     callbacks: {
          async session({ session, token }) {
               if (session.user) {
                    session.user.id = token.sub!;
               }
               return session;
          },
     },
};

export const getServerAuthSession = () => getServerSession(authOptions);