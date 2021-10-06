import { Box } from '@chakra-ui/layout';
import HeaderNav from 'components/headerNav';
import Footer from 'components/footer';

/*
 * Allows for footer to always appear at bottomm of the content area
 */
const MainLayout: React.FC = ({ children }) => {
  return (
    <Box
      maxW="100vw"
      pb={{ base: 32, md: 16 }}
      px="0"
      minH="100vh"
      pos="relative">
      <HeaderNav />
      {children}
      <Footer />
    </Box>
  );
};

export default MainLayout;
