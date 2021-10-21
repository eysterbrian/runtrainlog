export async function fitbitSignin() {
  const currUrl = window.location.href;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/signin`
  );

  //   {
  //     headers: {
  //       'Content-Type': 'application/x-www-form-urlencoded',
  //     },
  //     method: 'post',
  //     body: new URLSearchParams({
  //       json: true,
  //     }),
  //   }
  // );

  if (!res.ok) {
    console.log('Error in fitbit signin: ', res.statusText);
  } else {
    const data = await res.json();
  }

  window.location.replace(currUrl);

  // TODO: Show a toast with status
}

export async function fitbitSignout() {
  // const currUrl = window.location.href;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_MY_API_URL}/fitbit/signout`
  );
  const data = await res.json();
  console.log('fitbitSignout: ', data);
  return data;
}
