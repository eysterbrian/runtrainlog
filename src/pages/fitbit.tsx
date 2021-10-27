// Displays listing of recent fitbit workouts for the current user
import React from 'react';
import { useSession } from 'next-auth/client';
import { useQuery, useQueryClient } from 'react-query';
import Head from 'next/head';
import { ComponentWithAuth } from 'types/auth';
import { Loading } from 'components/Loading';
import {
  Box,
  Heading,
  Text,
  HStack,
  Button,
  Select,
  useToast,
  Input,
} from '@chakra-ui/react';
import {
  fetchFitbitActivities,
  TFitbitActivity,
} from 'lib/queries/fetchFitbitActivities';
import { fetchFitbitToken } from 'lib/queries/fetchFitbitToken';
import { FitbitWorkoutsTable } from 'components/FitbitWorkoutsTable';
import { fitbitSignout } from 'lib/client/fitbitAuth';
import { fetchFitbitAccount } from 'lib/queries/fetchFitbitAccount';
import { format } from 'date-fns';

const FitbitPage: ComponentWithAuth = () => {
  const [session] = useSession();
  const queryClient = useQueryClient();

  const [numWorkouts, setNumWorkouts] = React.useState(10);
  const [importDate, setImportDate] = React.useState(
    format(new Date(), 'yyy-MM-dd')
  );

  const fitbitAccountQuery = useQuery(
    ['fitbit', 'account', session?.user?.id],
    fetchFitbitAccount,
    {
      enabled: !!session?.user,
      staleTime: 10 * 60 * 1000,
    }
  );

  const fitbitTokenQuery = useQuery(
    ['fitbit', 'token', session?.user?.id],
    fetchFitbitToken,
    {
      enabled: !!session?.user && fitbitAccountQuery?.data?.connected,
      staleTime: 10 * 60 * 1000,
    }
  );

  // TODO: Smarter way to cache the random pages of activities
  const fitbitWorkoutsQuery = useQuery(
    ['fitbit', 'workouts', session?.user?.id, importDate, numWorkouts],
    () =>
      fetchFitbitActivities({
        fitbitAccessToken: fitbitTokenQuery?.data?.accessToken,
        limit: numWorkouts,
        beforeDate: importDate,
      }),
    {
      enabled: fitbitTokenQuery.isSuccess,
      staleTime: 10 * 60 * 1000,
    }
  );

  const toast = useToast();

  return (
    <>
      <Head>
        <title>Import Fitbit workouts</title>
      </Head>

      <HStack m="4">
        <Text>Fitbit Account: </Text>
        {fitbitAccountQuery.isSuccess && fitbitAccountQuery.data.connected ? (
          <>
            <Text color="green.400" fontWeight="bold">
              Connected
            </Text>
            <Button
              size="sm"
              onClick={async () => {
                // TODO: Show loading spinner during signout
                const data = await fitbitSignout();
                queryClient.invalidateQueries('fitbit');
                toast({ description: JSON.stringify(data) });
              }}>
              Disconnect
            </Button>
          </>
        ) : (
          <>
            <Text color="red.400" fontWeight="bold">
              None
            </Text>
            <Button as="a" href="/api/fitbit/signin">
              Connect
            </Button>
          </>
        )}
      </HStack>
      {fitbitAccountQuery?.data?.connected && (
        <>
          <HStack m="4">
            <Select
              defaultValue="5"
              width="sm"
              onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
                setNumWorkouts(parseInt(evt.target.value));
                console.log(evt.target.value);
              }}>
              <option value="10">10 workouts</option>
              <option value="20">20 workouts</option>
              <option value="30">30 workouts</option>
            </Select>
            <Text>Prior to: </Text>
            <Input
              width="sm"
              type="date"
              id="dateInput"
              name="dateInput"
              value={importDate}
              onChange={(evt) => setImportDate(evt.target.value)}
            />
          </HStack>

          {!fitbitWorkoutsQuery.isSuccess ? (
            <Loading />
          ) : (
            <Box py={6} px={4}>
              {fitbitWorkoutsQuery.data && (
                <>
                  <Heading as="h2">Fitbit Activities</Heading>
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
      )}
    </>
  );
};
FitbitPage.authRequired = true;
export default FitbitPage;
