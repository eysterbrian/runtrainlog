import { Session } from 'next-auth';
import { useQuery } from 'react-query';
import { format, add } from 'date-fns';

/**
 *
 * @param fitbitAccessToken
 * @returns
 */
export const fetchFitbitActivities = async (
  fitbitAccessToken: string | undefined
) => {
  if (!fitbitAccessToken) {
    throw new Error('Missing access token');
  }
  const queryParams = new URLSearchParams({
    beforeDate: format(add(new Date(), { days: 1 }), 'yyyy-MM-dd'),
    limit: '5',
    offset: '0',
    sort: 'desc',
  });

  const res = await fetch(
    `https://api.fitbit.com/1/user/-/activities/list.json?${queryParams.toString()}`,
    {
      headers: {
        'Accept-Language': 'en_US',
        Authorization: `Bearer ${fitbitAccessToken}`,
      },
      method: 'get',
    }
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchWorkouts');
  }
  const data = await res.json();
  return data;
};
