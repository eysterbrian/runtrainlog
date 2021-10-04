import {
  Box,
  chakra,
  Container,
  Stack,
  Icon,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from '@chakra-ui/react';
import { FaFacebookF, FaGithub, FaTwitter } from 'react-icons/fa';
import { ReactNode } from 'react';
import { MdOutlineRunCircle, MdRunCircle } from 'react-icons/md';

const Logo = (props: any) => {
  return <Icon as={MdOutlineRunCircle} w={12} h={12} color="brand.500" />;
};

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      w={8}
      h={8}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
      }}>
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue('gray.50', 'gray.900')}
      color={useColorModeValue('gray.700', 'gray.200')}>
      <Container
        as={Stack}
        maxW={'6xl'}
        py={4}
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        justify={{ base: 'center', md: 'space-between' }}
        align={{ base: 'center', md: 'center' }}>
        <Logo />
        <Text>&copy; 2020 Brian Eyster. All rights reserved</Text>
        <Stack direction={'row'} spacing={2}>
          <SocialButton
            label={'Twitter'}
            href={'https://twitter.com/BluegrassBrian'}>
            <FaTwitter />
          </SocialButton>
          <SocialButton
            label={'GitHub'}
            href={'https://github.com/eysterbrian'}>
            <FaGithub />
          </SocialButton>
          <SocialButton
            label={'Facebook'}
            href={'https://www.facebook.com/brian.eyster'}>
            <FaFacebookF />
          </SocialButton>
        </Stack>
      </Container>
    </Box>
  );
}
