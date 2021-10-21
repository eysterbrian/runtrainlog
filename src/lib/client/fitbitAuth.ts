/**
 * Uses fetch to call the fitbit signin API endpoint
 * This method DOES NOT work!
 */
export async function fitbitSignin() {
  console.log('fitbitSignin #1');
  const currUrl = window.location.href;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/signin`,
    {
      method: 'post',
      headers: {
        // 'Content-Type': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: 'follow',
      body: new URLSearchParams({
        json: 'true',
      }),
    }
  );

  // BUG: This crashes somewhere around here!!!
  console.log('fitbitSignin #2');
  if (!res.ok) {
    console.log('Error in fitbit signin: ', res.statusText);
  } else {
    const data = await res.json();
    console.log('fitbitSignin #3', data);
  }

  // window.location.replace(currUrl);
}

/**
 * Uses fetch to call the local fitbit signout API endpoint
 * @returns
 */
export async function fitbitSignout() {
  // const currUrl = window.location.href;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/signout`
  );
  if (!res.ok) {
    console.log('Error in fitbit signout: ', res.statusText);
    return { message: 'Error in fitbit signout' };
  }
  const data = await res.json();
  console.log('fitbitSignout: ', data);
  return data;
}
