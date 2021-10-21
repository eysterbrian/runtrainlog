import { NextApiHandler } from 'next';
import { AuthorizationCode, Token } from 'simple-oauth2';
import { getSession } from 'next-auth/client';
import prisma from 'lib/server/prisma';
import { fitbitAuthClient } from './signin';

const fitbitAuthHandler: NextApiHandler = async (req, res) => {
  const session = await getSession({ req });
  if (!session) {
    return res.status(400).send('User must be logged-in');
  }
  const userId = session.user?.id;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).send('Invalid userId');
  }

  /**
   * GET: Return the user's fitbit login status
   */
  if (req.method === 'GET') {
    // Get the user's fitbit token
    const fitbitToken = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        fitbitAccount: true,
      },
    });

    const jsonToken = fitbitToken?.fitbitAccount?.token;

    return res.status(200).json({ connected: !!jsonToken });
  } else if (req.method === 'DELETE') {
    /**
     *
     */
  }

  return res.status(200).send('Fitbit token deleted');
};
export default fitbitAuthHandler;
