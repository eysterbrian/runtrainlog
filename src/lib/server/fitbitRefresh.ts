import { AuthorizationCode, AuthorizationTokenConfig } from 'simple-oauth2';
import { fitbitAuthClient, FITBIT_SCOPE } from 'pages/api/fitbit/signin';

const EXPIRATION_WINDOW_IN_SECONDS = 300; // Window of time before the actual expiration to refresh the token

/**
 * Returns access token for current user, refreshing the token if necessary
 */
export const getFitbitAccessToken = async (): Promise<string | null> => {
  // Sample Data for testing purposes
  const accessTokenJsonString =
    '{"access_token":"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM0JLWEIiLCJzdWIiOiI2OERLWFEiLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJybG9jIHJociByYWN0IHJwcm8gcnNsZSIsImV4cCI6MTYzMzYxNjgzOSwiaWF0IjoxNjMzNTg4MDM5fQ.mK5pFEHRw9DStBQt1YAi8Bc5o0Cmr5COaTp5R7UpoUo","expires_in":28800,"refresh_token":"3bb4a34bff39b152126f28bc523256ace44ab9168a130f43b965a318ffd37eba","scope":"heartrate activity sleep profile location","token_type":"Bearer","user_id":"68DKXQ","expires_at":"2021-10-07T14:27:18.869Z"}';

  // TODO: Get user's token object from DB

  // Create the token from the persisted token
  const prevAccessToken = fitbitAuthClient.createToken(
    JSON.parse(accessTokenJsonString)
  );

  if (prevAccessToken.expired(EXPIRATION_WINDOW_IN_SECONDS)) {
    try {
      const refreshParams = {
        scope: FITBIT_SCOPE,
      };
      const newAccessToken = await prevAccessToken.refresh(refreshParams);

      console.log('New token', newAccessToken);

      // TODO: Persist new access token to DB
      return JSON.stringify(newAccessToken.token, null, 3);
    } catch (error: any) {
      console.log('Error refreshing access token: ', error.output);
      return null;
    }
  } else {
    console.log('Token not expired.  Refresh not needed.');
    return JSON.stringify(prevAccessToken.token, null, 3);
  }
};
