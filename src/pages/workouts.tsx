// Displays listing of all workouts for the current user

import fetchWorkouts from 'lib/queries/fetchWorkouts';
import { useSession } from 'next-auth/client';
import { useQuery } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';

const WorkoutsPage: ComponentWithAuth = () => {
  const [session, loading] = useSession();
  const { data } = useQuery('workouts', fetchWorkouts);
  return (
    <>
      <Head>
        <title>All workouts</title>
      </Head>
      <h2>Workouts Page!</h2>
      {JSON.stringify(data, null, 2)}
    </>
  );
};
WorkoutsPage.authRequired = true;
export default WorkoutsPage;
