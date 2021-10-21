// Displays listing of recent fitbit workouts for the current user
import React from 'react';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import fetchWorkouts from 'lib/queries/fetchWorkouts';
import { Loading } from 'components/Loading';
import { Box, HStack, Button, useDisclosure } from '@chakra-ui/react';

const FitbitPage: ComponentWithAuth = () => {
  const [session] = useSession();
  const workoutsQuery = useQuery(['fitbit', session?.user?.id], fetchWorkouts);

  return (
    <>
      <Head>
        <title>All workouts</title>
      </Head>

      {workoutsQuery.isLoading ? (
        <Loading />
      ) : (
        <Box py={6} px={4}>
          Fitbit Workouts
        </Box>
      )}
    </>
  );
};
FitbitPage.authRequired = true;
export default FitbitPage;
