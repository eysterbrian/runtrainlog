import { NextPage } from 'next';
import {
  Container,
  SimpleGrid,
  Image,
  Flex,
  Heading,
  Text,
  Stack,
  StackDivider,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoAnalyticsSharp } from 'react-icons/io5';
import { ReactElement } from 'react';
import { BsSmartwatch } from 'react-icons/bs';
import { FaLaptopMedical } from 'react-icons/fa';

interface FeatureProps {
  text: string;
  iconBg: string;
  icon?: ReactElement;
}

const Feature = ({ text, icon, iconBg }: FeatureProps) => {
  return (
    <Stack direction={'row'} align={'center'}>
      <Flex
        w={8}
        h={8}
        align={'center'}
        justify={'center'}
        rounded={'full'}
        bg={iconBg}>
        {icon}
      </Flex>
      <Text fontWeight={600}>{text}</Text>
    </Stack>
  );
};

const Home: NextPage = () => {
  return (
    <Container maxW={'5xl'} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stack spacing={4}>
          <Text
            textTransform={'uppercase'}
            color={'blue.400'}
            fontWeight={600}
            fontSize={'sm'}
            bg={useColorModeValue('blue.50', 'blue.900')}
            p={2}
            alignSelf={'flex-start'}
            rounded={'md'}>
            Our Story
          </Text>
          <Heading>A Training Tool for Runners</Heading>
          <Text color={'gray.500'} fontSize={'lg'}>
            Replace your messy training notebooks and complex spreadsheets, with
            a simple web training log
          </Text>
          <Stack
            spacing={4}
            divider={
              <StackDivider
                borderColor={useColorModeValue('gray.100', 'gray.700')}
              />
            }>
            <Feature
              icon={
                <Icon as={IoAnalyticsSharp} color={'brand.300'} w={5} h={5} />
              }
              iconBg={useColorModeValue('secondary.100', 'secondary.900')}
              text={'Analyze your weekly running volume'}
            />
            <Feature
              icon={
                <Icon as={FaLaptopMedical} color={'brand.500'} w={5} h={5} />
              }
              iconBg={useColorModeValue('secondary.100', 'secondary.900')}
              text={'Avoid painful overtraining injuries'}
            />
            <Feature
              icon={<Icon as={BsSmartwatch} color={'brand.500'} w={5} h={5} />}
              iconBg={useColorModeValue('secondary.100', 'secondary.900')}
              text={'Integrate with FitBit'}
            />
          </Stack>
        </Stack>
        <Flex>
          <Image
            rounded={'md'}
            alt={'Trail runner in the mountains'}
            src={
              'https://images.unsplash.com/photo-1560354790-a403c5a97e0f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3008&q=80'
            }
            objectFit={'cover'}
          />
        </Flex>
      </SimpleGrid>
    </Container>
  );
};

export default Home;
