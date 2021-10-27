// Displays listing of recent fitbit workouts for the current user
import React from 'react';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { Loading } from 'components/Loading';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import {
  fetchFitbitActivities,
  TFitbitActivity,
} from 'lib/queries/fetchFitbitActivities';
import { useFitbitTokenQuery } from 'lib/queries/fetchFitbitToken';
import { FitbitWorkoutsTable } from 'components/FitbitWorkoutsTable';

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
        <title>Import Fitbit workouts</title>
      </Head>

      {!fitbitWorkoutsQuery.isSuccess ? (
        <Loading />
      ) : (
        <Box py={6} px={4}>
          {fitbitWorkoutsQuery.data && (
            <>
              <Heading as="h2">Parsed activities</Heading>
              <FitbitWorkoutsTable
                fitbitActivities={fitbitWorkoutsQuery.data.activities}
              />
              <Heading as="h3" fontSize="xl" my="6">
                Raw activities API
              </Heading>
              <Text as="pre" fontSize="xs">
                {JSON.stringify(fitbitWorkoutsQuery.data, null, 3)}
              </Text>
            </>
          )}
        </Box>
      )}
    </>
  );
};
FitbitPage.authRequired = true;
export default FitbitPage;
