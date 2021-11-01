import { Session } from 'next-auth';
import { useQuery } from 'react-query';
import { format, add } from 'date-fns';
import { z } from 'zod';
import { parseISO, isValid } from 'date-fns';
import { modalityFromFitbitActivity } from 'lib/utils/fitbitUtils';

/**
 *
 * @param fitbitAccessToken
 * @returns
 */
export const fetchFitbitActivities = async ({
  fitbitAccessToken,
  limit,
  beforeDate,
}: {
  fitbitAccessToken: string | undefined;
  limit: number;
  beforeDate: string;
}) => {
  if (!fitbitAccessToken) {
    throw new Error('Missing access token');
  }
  const queryParams = new URLSearchParams({
    beforeDate: format(add(new Date(beforeDate), { days: 2 }), 'yyyy-MM-dd'),
    limit: limit.toString(),
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

  try {
    const data = await res.json();

    // Parse the raw API data into a typesafe object
    const fitbitActivities = fitbitActivitiesSchema.parse(data);
    return fitbitActivities;
  } catch (err) {
    console.log(err);
    throw new Error('Fitbit activities data is invalid');
  }
};

/**
 * Zod schema for the return value from fitbit 'activities' API
 *
 * Zod's default behavior is to strip all unknown properties from the object. So only
 * the properties defined in this schema will be available in TS.
 */
export const fitbitActivitiesSchema = z.object({
  activities: z.array(
    z
      .object({
        activityName: z.string(), // This will be transformed to 'modality'
        averageHeartRate: z.number(),
        distance: z.number().optional(), // "Spinning" activity will omit this value
        elevationGain: z.number().optional(),
        logId: z.number(),
        activeDuration: z.number(), // API value is in milliseconds

        speed: z.number().optional(), // "Spinning" activity will omit this value
        startTime:
          // zod will reject an ISO **string** using its built-in z.date() fn, so
          // we manually check whether the string version of a date is valid
          z.string().refine((val) => isValid(parseISO(val))),
      })
      // Remove the activeDuration field and replace with activeDurationSeconds
      .transform(({ activeDuration, activityName, logId, speed, ...vals }) => ({
        ...vals,
        activeDurationSeconds:
          // API value is in milliseconds, so convert to seconds
          Math.round(activeDuration / 1000),
        modality: modalityFromFitbitActivity(activityName),
        logId: String(logId),

        // 'speed' is unit of mph, so convert to sec / mile
        paceSecPerMile: speed ? Math.round((60 / speed) * 60) : undefined,
      }))
  ),
});

/**
 * Type for an individual activity from the Fitbit API
 */
export type TFitbitActivity = z.infer<
  typeof fitbitActivitiesSchema
>['activities'][number] & {
  // Add extra field to track whether this activity has been imported
  // into our app.
  //
  // This field never comes from the API directly, so only specify it in
  // this generated type rather than in the schema itself
  isImported?: boolean;
};
