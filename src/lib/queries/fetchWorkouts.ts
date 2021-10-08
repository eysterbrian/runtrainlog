const fetchWorkouts = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/users/me/workouts`
  );
  const data = await res.json();
  return data;
};
export default fetchWorkouts;
