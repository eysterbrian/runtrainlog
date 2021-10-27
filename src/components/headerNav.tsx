import {
  chakra,
  useColorModeValue,
  useDisclosure,
  UseDisclosureReturn,
  Flex,
  Box,
  HStack,
  VStack,
  Button,
  VisuallyHidden,
  CloseButton,
  Avatar,
  Tooltip,
  Icon,
  IconButton,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  MenuDivider,
  useToast,
} from '@chakra-ui/react';
import {
  AiFillBell,
  AiFillCalendar,
  AiFillContainer,
  AiFillHome,
  AiOutlineMenu,
} from 'react-icons/ai';

import { SiFitbit } from 'react-icons/si';
import { MdRunCircle } from 'react-icons/md';
import { BsPlus } from 'react-icons/bs';
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';
import NextLink from 'next/link';
import { AddWorkoutModal } from './AddWorkoutModal';
import router, { useRouter } from 'next/router';
import { fitbitSignin, fitbitSignout } from 'lib/client/fitbitAuth';

const MobileNav: React.VFC<{ showMobileNav: UseDisclosureReturn }> = ({
  showMobileNav,
}) => {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box display={{ base: 'inline-flex', md: 'none' }}>
      <NextLink href="/" passHref>
        <IconButton
          as="a"
          display={{ base: 'flex', md: 'none' }}
          aria-label="Open menu"
          fontSize="20px"
          color={useColorModeValue('gray.800', 'inherit')}
          variant="ghost"
          icon={<AiOutlineMenu />}
          onClick={showMobileNav.onOpen}
        />
      </NextLink>
      <VStack
        pos="absolute"
        top={0}
        left={0}
        right={0}
        display={showMobileNav.isOpen ? 'flex' : 'none'}
        flexDirection="column"
        p={2}
        pb={4}
        m={2}
        bg={bg}
        spacing={3}
        rounded="sm"
        shadow="sm">
        <CloseButton
          aria-label="Close menu"
          justifySelf="self-start"
          onClick={showMobileNav.onClose}
        />
        <NextLink href="/workouts" passHref>
          <Button as="a" w="full" variant="ghost" leftIcon={<AiFillHome />}>
            Dashboard
          </Button>
        </NextLink>
        <Button
          w="full"
          variant="solid"
          colorScheme="brand"
          leftIcon={<AiFillContainer />}>
          Plan
        </Button>
        <Button w="full" variant="ghost" leftIcon={<AiFillCalendar />}>
          This Week
        </Button>
        <NextLink href="/fitbit" passHref>
          <Button w="full" variant="ghost" leftIcon={<SiFitbit />}>
            Fitbit Import
          </Button>
        </NextLink>
      </VStack>
    </Box>
  );
};

const HeaderNav: React.VFC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const showMobileNav = useDisclosure();
  const addWorkoutModalDisclosure = useDisclosure();

  const router = useRouter();
  const [session, sessionStatus] = useSession();
  console.log('Session from headerNav: ', session);

  const toast = useToast();

  const profileTooltip = session && (
    <>
      {session.user?.name} <br /> <em>{session.user?.email}</em>
    </>
  );

  return (
    <React.Fragment>
      <chakra.header
        bg={bg}
        w="full"
        px={{ base: 2, sm: 4 }}
        py={4}
        shadow="md">
        <Flex alignItems="center" justifyContent="space-between" mx="auto">
          <HStack display="flex" spacing={3} alignItems="center">
            {session && <MobileNav showMobileNav={showMobileNav} />}
            <NextLink href="/" passHref>
              <chakra.a
                href="/"
                title="Home Page"
                display="flex"
                alignItems="center">
                <Icon as={MdRunCircle} w={12} h={12} color="brand.500" />
                <VisuallyHidden>Runner&apos;s Log</VisuallyHidden>
              </chakra.a>
            </NextLink>

            {session && (
              <HStack spacing={3} display={{ base: 'none', md: 'inline-flex' }}>
                <NextLink href="/workouts" passHref>
                  <Button
                    as="a"
                    variant="ghost"
                    leftIcon={<AiFillHome />}
                    size="sm">
                    Dashboard
                  </Button>
                </NextLink>
                <Button
                  variant="solid"
                  colorScheme="brand"
                  leftIcon={<AiFillContainer />}
                  size="sm">
                  My Plan
                </Button>
                {/* <Button variant="ghost" leftIcon={<AiFillCalendar />} size="sm">
                  This Week
                </Button> */}
                <NextLink href="/fitbit" passHref>
                  <Button
                    as="a"
                    variant="ghost"
                    leftIcon={<SiFitbit />}
                    size="sm">
                    Fitbit Import
                  </Button>
                </NextLink>
              </HStack>
            )}
          </HStack>
          {session ? (
            !showMobileNav.isOpen && (
              <HStack spacing={3} display="flex" alignItems="center">
                <Button
                  colorScheme="secondary"
                  leftIcon={<BsPlus />}
                  onClick={addWorkoutModalDisclosure.onOpen}>
                  New Run
                </Button>

                <Flex alignItems={'center'}>
                  <Menu>
                    <Tooltip label={profileTooltip}>
                      <MenuButton
                        as={Button}
                        rounded={'full'}
                        variant={'link'}
                        cursor={'pointer'}
                        minW={0}>
                        <Avatar
                          size="sm"
                          name={session.user?.name || 'Unknown'}
                          src={session.user?.image || undefined}
                        />
                      </MenuButton>
                    </Tooltip>
                    <MenuList>
                      <MenuItem>
                        {session.user?.name || 'Unknown'}&apos;s Profile
                      </MenuItem>
                      <MenuDivider />
                      {!session.user.fitbitId ? (
                        <>
                          <MenuItem as="a" href="/api/fitbit/signin">
                            Connect with Fitbit URL
                          </MenuItem>
                          {/* <MenuItem onClick={fitbitSignin}>
                            Connect with fitbitSignin()
                          </MenuItem> */}
                        </>
                      ) : (
                        <MenuItem
                          onClick={async () => {
                            // HACK: This blocks the UI while we wait for the signout
                            const data = await fitbitSignout();
                            toast({ description: JSON.stringify(data) });
                            // router.reload();
                          }}>
                          Disconnect from Fitbit
                        </MenuItem>
                      )}
                      <MenuDivider />
                      <MenuItem
                        onClick={() =>
                          signOut({
                            callbackUrl: `${process.env.NEXT_PUBLIC_MY_URL}/`,
                          })
                        }>
                        Log Out
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </HStack>
            )
          ) : (
            <HStack spacing={3} display="flex" alignItems="center">
              <Button
                colorScheme="secondary"
                onClick={() =>
                  signIn('google', {
                    callbackUrl: `${process.env.NEXT_PUBLIC_MY_URL}/workouts`,
                  })
                }>
                Login
              </Button>
            </HStack>
          )}
        </Flex>
      </chakra.header>
      <AddWorkoutModal modalDisclosure={addWorkoutModalDisclosure} />
    </React.Fragment>
  );
};

export default HeaderNav;
