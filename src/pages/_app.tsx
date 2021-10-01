import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as NextAuthProvider } from 'next-auth/client';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
      <NextAuthProvider session={pageProps.session}>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </NextAuthProvider>
    </>
  );
}
export default MyApp;
