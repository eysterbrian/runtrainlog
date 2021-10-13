const fetchWorkouts = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts`
  );
  if (!res.ok) {
    throw new Error('Network response error in fetchWorkouts');
  }
  const data = await res.json();
  return data;
};
export default fetchWorkouts;
