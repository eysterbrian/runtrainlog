import { Session } from 'next-auth';
import { useQuery } from 'react-query';

/**
 *
 * @returns
 */
export const fetchFitbitToken = async (): Promise<{ accessToken: string }> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/token`);
  if (!res.ok) {
    throw new Error('Network response error in fetchFitbitToken');
  }
  const data = await res.json();
  if (!data?.accessToken) {
    throw new Error('Missing access token');
  }
  return { accessToken: data.accessToken };
};

/**
 *
 * @param session
 * @returns
 */
export const useFitbitTokenQuery = (session: Session | null) =>
  useQuery(['fitbitToken', session?.user?.id], fetchFitbitToken, {
    enabled: !!session?.user,
    staleTime: 10 * 60 * 1000,
  });
