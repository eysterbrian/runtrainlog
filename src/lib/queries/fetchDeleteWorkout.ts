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
