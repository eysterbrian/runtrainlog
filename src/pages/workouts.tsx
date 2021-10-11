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

const WorkoutsPage: ComponentWithAuth = () => {
  const [session] = useSession();
  const workoutsQuery = useQuery(
    ['workouts', session?.user?.id],
    fetchWorkouts
  );

  return (
    <>
      <Head>
        <title>All workouts</title>
      </Head>

      {workoutsQuery.isLoading ? (
        <Loading />
      ) : (
        <>
          <WorkoutsTable workouts={workoutsQuery.data.workouts} />
        </>
      )}
    </>
  );
};
WorkoutsPage.authRequired = true;
export default WorkoutsPage;
