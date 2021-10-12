import React from 'react';
import { useSession } from 'next-auth/client';
import { ComponentWithAuth } from 'types/auth';
import Head from 'next/head';
import { Box } from '@chakra-ui/react';
import { AddWorkoutForm } from 'components/AddWorkoutForm';

const AddWorkoutPage: ComponentWithAuth = () => {
  return (
    <>
      <Head>
        <title>Add new workout</title>
      </Head>

      <Box py={6} px={4}>
        <AddWorkoutForm />
      </Box>
    </>
  );
};
AddWorkoutPage.authRequired = true;
export default AddWorkoutPage;
