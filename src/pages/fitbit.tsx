// Displays listing of recent fitbit workouts for the current user
import React from 'react';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { Loading } from 'components/Loading';
import { Box, Heading, HStack, Button, useDisclosure } from '@chakra-ui/react';
import {
  fetchFitbitActivities,
  fitbitActivitiesSchema,
  TFitbitActivities,
  TFitbitActivity,
} from 'lib/queries/fetchFitbitActivities';
import { useFitbitTokenQuery } from 'lib/queries/fetchFitbitToken';
import { Workout } from '@prisma/client';
import { modalityFromFitbitActivity } from 'lib/utils/fitbitUtils';

const FitbitPage: ComponentWithAuth = () => {
  const [session] = useSession();

  const fitbitTokenQuery = useFitbitTokenQuery(session);

  const fitbitWorkoutsQuery = useQuery(
    ['fitbitWorkouts', session?.user?.id],
    () => fetchFitbitActivities(fitbitTokenQuery?.data?.accessToken),
    {
      enabled: fitbitTokenQuery.isSuccess,
      staleTime: 10 * 60 * 1000,
    }
  );

  let fitbitActivities: TFitbitActivities | null = null;
  try {
    if (fitbitWorkoutsQuery.data && fitbitWorkoutsQuery.isSuccess) {
      fitbitActivities = fitbitActivitiesSchema.parse(fitbitWorkoutsQuery.data);
    }
  } catch (err) {
    console.log(err);
  }

  // const fitbitWorkouts = React.useMemo<TFitbitActivity[]>(
  //   () =>
  //     fitbitActivities.activities.map((activity) => ({
  //       distance: activity.distance,
  //       elevation: activity.elevationGain,
  //       startTime: activity.startTime,
  //       pace: activity.speed,
  //       modality: modalityFromFitbitActivity(activity.activityName),
  //       avgHeartRate:
  //     })),
  //   [fitbitWorkoutsQuery.data]
  // );

  return (
    <>
      <Head>
        <title>Import Fitbit workouts</title>
      </Head>

      {!fitbitWorkoutsQuery.isSuccess ? (
        <Loading />
      ) : (
        <Box py={6} px={4}>
          {fitbitActivities ? (
            <>
              <Heading>Parsed activities</Heading>
              <pre>{JSON.stringify(fitbitActivities, null, 3)}</pre>
            </>
          ) : (
            <>
              <Heading>Raw API Response</Heading>
              <pre>{JSON.stringify(fitbitWorkoutsQuery.data, null, 3)}</pre>
            </>
          )}
        </Box>
      )}
    </>
  );
};
FitbitPage.authRequired = true;
export default FitbitPage;
