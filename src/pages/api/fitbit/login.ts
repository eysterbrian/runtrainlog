/*
 * From FitBit's application registration page:
 * https://dev.fitbit.com/apps/details/23BKXB
 *
 * Redirect URL: http://localhost:3029/api/fitbit/callback
 * OAuth 2.0: Authorization URI:  https://www.fitbit.com/oauth2/authorize
 * OAuth 2.0: Access/Refresh Token Request URI:  https://api.fitbit.com/oauth2/token
 *
 */

import { NextApiHandler } from 'next';
import { AuthorizationCode } from 'simple-oauth2';
import { randomBytes } from 'crypto';

export const fitbitAuthClient = new AuthorizationCode({
  client: {
    id: process.env.FITBIT_CLIENT_ID!,
    secret: process.env.FITBIT_CLIENT_SECRET!,
  },
  auth: {
    tokenHost: 'https://api.fitbit.com',
    tokenPath: '/oauth2/token',
    authorizeHost: 'https://www.fitbit.com',
    authorizePath: '/oauth2/authorize',
  },
});

export const FITBIT_STATE = randomBytes(4).toString('hex');
export const FITBIT_SCOPE = 'activity profile heartrate sleep location';

const fitbitLoginHandler: NextApiHandler = async (req, res) => {
  console.log('FitBit Client ID: ', process.env.FITBIT_CLIENT_ID);
  console.log('FitBit Client Secret: ', process.env.FITBIT_CLIENT_SECRET);
  const authUrl = fitbitAuthClient.authorizeURL({
    redirect_uri: process.env.FITBIT_REDIRECT,
    // response_type: 'code',
    state: FITBIT_STATE,
    scope: FITBIT_SCOPE,
  });
  console.log({ authUrl });

  res.redirect(authUrl);
};

export default fitbitLoginHandler;
