// Displays listing of recent fitbit workouts for the current user
import React from 'react';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { Loading } from 'components/Loading';
import { Box, HStack, Button, useDisclosure } from '@chakra-ui/react';
import { fetchFitbitActivities } from 'lib/queries/fetchFitbitActivities';
import { useFitbitTokenQuery } from 'lib/queries/fetchFitbitToken';

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

  return (
    <>
      <Head>
        <title>All workouts</title>
      </Head>

      {!fitbitWorkoutsQuery.isSuccess ? (
        <Loading />
      ) : (
        <Box py={6} px={4}>
          Fitbit Workouts
          <pre>{JSON.stringify(fitbitWorkoutsQuery.data, null, 3)}</pre>
        </Box>
      )}
    </>
  );
};
FitbitPage.authRequired = true;
export default FitbitPage;
