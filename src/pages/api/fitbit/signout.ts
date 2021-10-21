import { NextApiHandler } from 'next';
import { AuthorizationCode, Token } from 'simple-oauth2';
import { getSession } from 'next-auth/client';
import prisma from 'lib/server/prisma';
import { fitbitAuthClient } from './signin';

const fitbitSignoutHandler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).send('User must be logged-in');
  }
  const userId = session.user?.id;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).send('Invalid userId');
  }

  // Get the user's fitbit token
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      fitbitAccount: true,
    },
  });

  const jsonToken = user?.fitbitAccount?.token;
  if (!jsonToken) {
    return res.status(400).send('No Fitbit account for this user');
  }

  const prevAccessToken = fitbitAuthClient.createToken(JSON.parse(jsonToken));
  prevAccessToken.revokeAll();
  const deletedToken = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      fitbitAccount: {
        delete: true,
      },
    },
  });

  return res.status(200).send('Fitbit token deleted');
};
export default fitbitSignoutHandler;
