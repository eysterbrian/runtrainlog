/**
 * Fetch command to delete the specified workout
 * @param workoutId
 * @returns
 */
export async function fetchDeleteWorkout(workoutId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts/${workoutId}`,
    {
      method: 'DELETE',
    }
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchDeleteWorkout');
  }

  const data = await res.json();
  return data;
}

/**
 * Fetch command to delete a list of workouts by calling our API
 * @param workoutIds (array of workoutID strings)
 * @returns
 */
export async function fetchDeleteManyWorkouts(workoutIds: string[]) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts`,
    {
      method: 'DELETE',
      body: JSON.stringify({ workoutIds }),
    }
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchDeleteManyWorkouts');
  }

  const data = await res.json();
  return data;
}
