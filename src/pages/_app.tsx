import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as NextAuthProvider } from 'next-auth/client';
import customTheme from 'theme/theme';
import 'theme/styles.css';
import MainLayout from 'components/mainLayout';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <NextAuthProvider session={pageProps.session}>
        <ChakraProvider theme={customTheme}>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </ChakraProvider>
      </NextAuthProvider>
    </>
  );
}
export default MyApp;
