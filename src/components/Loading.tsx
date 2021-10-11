import { Center, Spinner, VisuallyHidden } from '@chakra-ui/react';

export const Loading: React.FC = () => {
  return (
    <Center>
      <Spinner size="xl" color="brand.500" label="Loading..." thickness="8px" />
    </Center>
  );
};
