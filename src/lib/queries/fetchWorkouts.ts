import { Workout } from '@prisma/client';

const fetchWorkouts = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts`
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchWorkouts');
  }
  const data = await res.json();

  // TODO: Add a zod schema here rather than explicit type coercion??
  return data as { id: string; workouts: Workout[] };
};
export default fetchWorkouts;
