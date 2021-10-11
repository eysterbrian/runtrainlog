// Displays listing of all workouts for the current user
import React from 'react';
import fetchWorkouts from 'lib/queries/fetchWorkouts';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { TestTable } from 'components/TestTable';

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
      <h2>Workouts Page!</h2>

      {workoutsQuery.isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <TestTable />
          <pre>{JSON.stringify(workoutsQuery.data, null, 2)}</pre>
        </>
      )}
    </>
  );
};
WorkoutsPage.authRequired = true;
export default WorkoutsPage;
