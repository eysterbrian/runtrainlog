import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as NextAuthProvider } from 'next-auth/client';
import customTheme from 'theme/theme';
import HeaderNav from 'components/headerNav';
import Footer from 'components/footer';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextAuthProvider session={pageProps.session}>
        <ChakraProvider theme={customTheme}>
          <HeaderNav />
          <Component {...pageProps} />
          <Footer />
        </ChakraProvider>
      </NextAuthProvider>
    </>
  );
}
export default MyApp;
