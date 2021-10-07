import { AuthorizationCode, AuthorizationTokenConfig } from 'simple-oauth2';
import { NextApiHandler } from 'next';
import { fitbitAuthClient } from './login';

const fitbitCallbackHandler: NextApiHandler = async (req, res) => {
  const code = req.query?.code as string;
  console.log(req.query);
  const options: AuthorizationTokenConfig = {
    code,
    redirect_uri: process.env.FITBIT_REDIRECT,
  };

  try {
    const accessToken = await fitbitAuthClient.getToken(options);

    console.log('Resulting token: ', accessToken);

    console.log('stringified', JSON.stringify(accessToken));
    /*
    {"access_token":"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM0JLWEIiLCJzdWIiOiI2OERLWFEiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJybG9jIHJociByYWN0IHJwcm8gcnNsZSIsImV4cCI6MTYzMzYxNjgzOSwiaWF0IjoxNjMzNTg4MDM5fQ.mK5pFEHRw9DStBQt1YAi8Bc5o0Cmr5COaTp5R7UpoUo","expires_in":28800,"refresh_token":"3bb4a34bff39b152126f28bc523256ace44ab9168a130f43b965a318ffd37eba","scope":"heartrate activity sleep profile location","token_type":"Bearer","user_id":"68DKXQ","expires_at":"2021-10-07T14:27:18.869Z"}
    */

    // TODO: Store stringified accessToken in DB, and maybe also the current access_token?

    return res.status(200).send(JSON.stringify(accessToken));
  } catch (error) {
    console.log('Access token error', error.messsage);
    return res.status(500).json('Authentication failed');
  }
};
export default fitbitCallbackHandler;
