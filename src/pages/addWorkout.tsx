import React from 'react';
import { useSession } from 'next-auth/client';
import { ComponentWithAuth } from 'types/auth';
import Head from 'next/head';
import { VStack, Button, Container, Heading } from '@chakra-ui/react';
import { AddWorkoutForm, SubmittingState } from 'components/AddWorkoutForm';
import { useRouter } from 'next/router';

const AddWorkoutPage: ComponentWithAuth = () => {
  const [submittingState, setSubmittingState] =
    React.useState<SubmittingState>('idle');
  const router = useRouter();

  if (submittingState === 'isSubmitted') {
    router.push('/workouts');
  }

  return (
    <>
      <Head>
        <title>Add new workout</title>
      </Head>

      <Container>
        <Heading fontSize="xl" my="4" mx="8">
          Add a new workout
        </Heading>
        <AddWorkoutForm updateSubmitState={setSubmittingState} />
      </Container>
    </>
  );
};
AddWorkoutPage.authRequired = true;
export default AddWorkoutPage;
