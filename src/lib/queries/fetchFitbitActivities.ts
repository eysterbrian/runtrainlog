import { Session } from 'next-auth';
import { useQuery } from 'react-query';
import { format, add } from 'date-fns';
import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';

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

/**
 * Zod schema for the return value from fitbit 'activities' API
 *
 * Zod's default behavior is to strip all unknown properties from the object. So only
 * the properties defined in this schema will be available in TS.
 */
export const fitbitActivitiesSchema = z.object({
  activities: z.array(
    z.object({
      activityName: z.string(),
      averageHeartRate: z.number(),
      distance: z.number().optional(), // "Spinning" activity will omit this value
      elevationGain: z.number(),
      logId: z.number(),
      speed: z.number().optional(), // "Spinning" activity will omit this value
      startTime:
        // zod will reject an ISO **string** using its built-in z.date() fn, so
        // we manually check whether the string version of a date is valid
        z.union([z.date(), z.string().refine((val) => isValid(parseISO(val)))]),
    })
  ),
});
export type TFitbitActivities = z.infer<typeof fitbitActivitiesSchema>;
export type TFitbitActivity = TFitbitActivities['activities'][number];
