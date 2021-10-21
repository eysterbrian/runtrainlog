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
    console.log('🐞 No fitbit account for this user');
    return res.status(400).json({ message: 'No Fitbit account for this user' });
  }

  console.log('🐞 signout: jsonToken', jsonToken);

  try {
    const prevAccessToken = fitbitAuthClient.createToken(JSON.parse(jsonToken));
    console.log('🐞 prevAccessToken: ', prevAccessToken);

    prevAccessToken.revoke('access_token');
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

    console.log('Fitbit token deleted');
    return res.status(200).json({ message: 'Fitbit token deleted' });
  } catch (err) {
    console.log('Error in signout');
    return res.status(400).json({ message: 'Error in signout' });
  }
};
export default fitbitSignoutHandler;
