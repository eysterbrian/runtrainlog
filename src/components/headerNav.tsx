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
} from '@chakra-ui/react';
import {
  AiFillBell,
  AiFillCalendar,
  AiFillContainer,
  AiFillHome,
  AiOutlineMenu,
} from 'react-icons/ai';
import { MdRunCircle } from 'react-icons/md';
import { BsPlus } from 'react-icons/bs';
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/client';

const MobileNav: React.VFC<{ showMobileNav: UseDisclosureReturn }> = ({
  showMobileNav,
}) => {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box display={{ base: 'inline-flex', md: 'none' }}>
      <IconButton
        display={{ base: 'flex', md: 'none' }}
        aria-label="Open menu"
        fontSize="20px"
        color={useColorModeValue('gray.800', 'inherit')}
        variant="ghost"
        icon={<AiOutlineMenu />}
        onClick={showMobileNav.onOpen}
      />
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
        <Button w="full" variant="ghost" leftIcon={<AiFillHome />}>
          Dashboard
        </Button>
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
      </VStack>
    </Box>
  );
};

const HeaderNav: React.VFC = () => {
  const bg = useColorModeValue('white', 'gray.800');
  const showMobileNav = useDisclosure();
  const [session, sessionStatus] = useSession();

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
            <chakra.a
              href="/"
              title="Home Page"
              display="flex"
              alignItems="center">
              <Icon as={MdRunCircle} w={12} h={12} color="brand.500" />
              <VisuallyHidden>Runner&apos;s Log</VisuallyHidden>
            </chakra.a>

            {session && (
              <HStack spacing={3} display={{ base: 'none', md: 'inline-flex' }}>
                <Button variant="ghost" leftIcon={<AiFillHome />} size="sm">
                  Dashboard
                </Button>
                <Button
                  variant="solid"
                  colorScheme="brand"
                  leftIcon={<AiFillContainer />}
                  size="sm">
                  My Plan
                </Button>
                <Button variant="ghost" leftIcon={<AiFillCalendar />} size="sm">
                  This Week
                </Button>
              </HStack>
            )}
          </HStack>
          {session ? (
            !showMobileNav.isOpen && (
              <HStack spacing={3} display="flex" alignItems="center">
                <Button colorScheme="secondary" leftIcon={<BsPlus />}>
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
                      <MenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                        Log Out
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              </HStack>
            )
          ) : (
            <HStack spacing={3} display="flex" alignItems="center">
              <Button colorScheme="secondary" onClick={() => signIn('google')}>
                Login
              </Button>
            </HStack>
          )}
        </Flex>
      </chakra.header>
    </React.Fragment>
  );
};

export default HeaderNav;
