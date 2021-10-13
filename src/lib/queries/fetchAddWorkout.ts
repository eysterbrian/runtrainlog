import { TNewWorkoutSchema } from 'lib/validators/addWorkoutSchema';

export async function fetchAddWorkout(values: TNewWorkoutSchema) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts`,
    {
      method: 'POST',
      body: JSON.stringify(values),
    }
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchAddWorkout');
  }

  const data = await res.json();
  return data;
}
