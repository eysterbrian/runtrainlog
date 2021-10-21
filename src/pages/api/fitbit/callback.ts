import { AuthorizationCode, AuthorizationTokenConfig } from 'simple-oauth2';
import { NextApiHandler } from 'next';
import { fitbitAuthClient } from './signin';
import prisma from 'lib/server/prisma';

const fitbitCallbackHandler: NextApiHandler = async (req, res) => {
  const code = req.query?.code as string;
  console.log(req.query);
  const options: AuthorizationTokenConfig = {
    code,
    redirect_uri: process.env?.FITBIT_REDIRECT ?? '',
  };

  // Get the userId from the state URL param passed to oauth during login
  const userId = req.query?.state;
  if (!userId || Array.isArray(userId)) {
    console.log('Missing userId in state from fitbit callback');
    return res.status(500).send('Missing userId in state from fitbit callback');
  }

  try {
    const accessToken = await fitbitAuthClient.getToken(options);

    console.log('Callback - Resulting token: ', accessToken);

    const fitbitUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fitbitAccount: {
          upsert: {
            create: {
              id: accessToken.token.user_id,
              token: JSON.stringify(accessToken.token),
            },
            update: {
              id: accessToken.token.user_id,
              token: JSON.stringify(accessToken.token),
            },
          },
        },
      },
      include: {
        fitbitAccount: true,
      },
    });

    console.log(fitbitUser);
    // return res.status(200).send(JSON.stringify(accessToken));
    res.redirect(307, '/');
  } catch (error) {
    console.log('Access token error', error);
    return res.status(500).json('Authentication failed');
  }
};
export default fitbitCallbackHandler;
