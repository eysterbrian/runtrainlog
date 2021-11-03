import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth, { User } from 'next-auth';
import Providers from 'next-auth/providers';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from 'lib/server/prisma';

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session(session, userOrJwt) {
      // Since we don't use JWT, this value is definitely a User
      const user: User = userOrJwt as User;

      return {
        expires: session.expires,
        user: {
          ...session.user,
          id: user.id as string,
          fitbitId: user?.fitbitId ?? '',
        },
      };
    },
  },
  // debug: true,
});
