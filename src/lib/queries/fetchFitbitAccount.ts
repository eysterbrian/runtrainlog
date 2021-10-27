import { Session } from 'next-auth';
import { useQuery } from 'react-query';

/**
 * Gets the status of the user's fitbit connection
 * @returns
 */
export const fetchFitbitAccount = async (): Promise<{
  connected: boolean;
  fitbitId: string | undefined;
}> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/auth`, {
    method: 'get',
  });
  if (!res.ok) {
    throw new Error('Network response error in fetchFitbitToken');
  }
  const data = await res.json();
  return data;
};

/**
 *
 * @param session
 * @returns
 */
export const useFitbitAccountQuery = (session: Session | null) =>
  useQuery(['fitbitAccount', session?.user?.id], fetchFitbitAccount, {
    enabled: !!session?.user,
    staleTime: 10 * 60 * 1000,
  });
