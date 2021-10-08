import type { AppProps } from 'next/app';
import { ChakraProvider } from '@chakra-ui/react';
import { Provider as NextAuthProvider } from 'next-auth/client';
import customTheme from 'theme/theme';
import 'theme/styles.css';
import MainLayout from 'components/mainLayout';
import queryClient from 'lib/client/react-query';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { Hydrate } from 'react-query/hydration';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={false} />
        <Hydrate state={pageProps.dehydratedState}>
          <NextAuthProvider session={pageProps.session}>
            <ChakraProvider theme={customTheme}>
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </ChakraProvider>
          </NextAuthProvider>
        </Hydrate>
      </QueryClientProvider>
    </>
  );
}
export default MyApp;
