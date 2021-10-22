import { NextApiHandler } from 'next';
import { AuthorizationCode, Token } from 'simple-oauth2';
import { getSession } from 'next-auth/client';
import prisma from 'lib/server/prisma';
import { fitbitAuthClient, FITBIT_SCOPE } from './signin';

const EXPIRATION_WINDOW_IN_SECONDS = 300; // Window of time before the actual expiration to refresh the token

/**
 * Returns the current fitbit access token, refreshed if necessary
 * @param req
 * @param res
 * @returns
 */
const fitbitTokenHandler: NextApiHandler = async (req, res) => {
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

    const accessTokenString = fitbitToken?.fitbitAccount?.token;
    if (!accessTokenString) {
      return res.status(400).send('User must reauthorize with Fitbit');
    }

    // Create the token from the persisted token
    const prevAccessToken = fitbitAuthClient.createToken(
      JSON.parse(accessTokenString)
    );

    if (prevAccessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
      try {
        const refreshParams = {
          scope: FITBIT_SCOPE,
        };
        const newAccessToken = await prevAccessToken.refresh(refreshParams);

        console.log('New token', newAccessToken);

        // Persist the user's new access token
        const fitbitToken = await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            fitbitAccount: {
              update: {
                token: JSON.stringify(newAccessToken),
              },
            },
          },
        });

        return res
          .status(200)
          .json({ accessToken: newAccessToken.token.access_token });
      } catch (error: any) {
        console.log('Error refreshing access token: ', error.output);
        return res
          .status(400)
          .json({ message: 'Error refreshing access token' });
      }
    } else {
      console.log('Token not expired.  Refresh not needed.');
      return res
        .status(200)
        .json({ accessToken: prevAccessToken.token.access_token });
    }
  } else if (req.method === 'DELETE') {
    /**
     *
     */
  }

  return res.status(2400).json({ message: 'Unsupported operation' });
};
export default fitbitTokenHandler;
