// Displays listing of all workouts for the current user
import React from 'react';
import fetchWorkouts from 'lib/queries/fetchWorkouts';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { TestTable } from 'components/TestTable';
import { WorkoutsTable } from 'components/WorkoutsTable';
import { Loading } from 'components/Loading';
import { Box, HStack, Button, useDisclosure } from '@chakra-ui/react';
import { AddWorkoutModal } from 'components/AddWorkoutModal';

const WorkoutsPage: ComponentWithAuth = () => {
  const [session] = useSession();
  const workoutsQuery = useQuery(
    ['workouts', session?.user?.id],
    fetchWorkouts
  );

  const addWorkoutModalDisclosure = useDisclosure();

  return (
    <>
      <Head>
        <title>All workouts</title>
      </Head>

      {workoutsQuery.isLoading ? (
        <Loading />
      ) : (
        <Box py={6} px={4}>
          <HStack>
            <Button onClick={addWorkoutModalDisclosure.onOpen}>
              Add New Workout
            </Button>
            <Button>Show/Hide Columns</Button>
            <Button>Filter</Button>
          </HStack>
          <WorkoutsTable workouts={workoutsQuery.data.workouts} />
          <AddWorkoutModal modalDisclosure={addWorkoutModalDisclosure} />
        </Box>
      )}
    </>
  );
};
WorkoutsPage.authRequired = true;
export default WorkoutsPage;
