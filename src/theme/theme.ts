import { extendTheme, ThemeConfig, theme } from '@chakra-ui/react';

const config: ThemeConfig = {
  useSystemColorMode: true,
};

const colors = {
  brand: {
    50: '#ffedde',
    100: '#fdcfb3',
    200: '#f8af87',
    300: '#f39059',
    400: '#ee712a',
    500: '#d55711',
    600: '#a6440b',
    700: '#773006',
    800: '#491b01',
    900: '#1f0700',
  },
  secondary: {
    50: '#ddf7ff',
    100: '#b2e2ff',
    200: '#83cefb',
    300: '#55bbf9',
    400: '#2da7f5',
    500: '#1c8edc',
    600: '#0f6eac',
    700: '#044f7c',
    800: '#002f4c',
    900: '#00111e',
  },
};

const styles = {
  global: {
    // '.top-container': {
    //   pb: '16',
    //   minHeight: '100vh',
    //   position: 'relative',
    // },
  },
};

const fonts = {
  heading: `Ubuntu, ${theme.fonts.heading}`,
  body: `Roboto, ${theme.fonts.body}`,
};

export default extendTheme({ config, colors, fonts, styles });
