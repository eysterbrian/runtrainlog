import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from 'lib/clients/prisma';

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: PrismaAdapter(prisma),
});
