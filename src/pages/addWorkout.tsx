import React from 'react';
import { useSession } from 'next-auth/client';
import { ComponentWithAuth } from 'types/auth';
import Head from 'next/head';
import { VStack, Button, Container, Heading } from '@chakra-ui/react';
import { AddWorkoutForm, SubmittingState } from 'components/AddWorkoutForm';

const AddWorkoutPage: ComponentWithAuth = () => {
  return (
    <>
      <Head>
        <title>Add new workout</title>
      </Head>

      <Container>
        <Heading fontSize="xl" my="4" mx="8">
          Add a new workout
        </Heading>
        <AddWorkoutForm />
      </Container>
    </>
  );
};
AddWorkoutPage.authRequired = true;
export default AddWorkoutPage;
