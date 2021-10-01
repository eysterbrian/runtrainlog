import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ChakraProvider } from '@chakra-ui/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </>
  );
}
export default MyApp;
