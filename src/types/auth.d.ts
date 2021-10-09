import { AppProps } from 'next/app';
import { NextComponentType, NextPageContext } from 'next';
import { NextComponentWithAuth } from 'types/auth';

/**
 * Authentication configuration
 */
export interface AuthEnabledComponentConfig {
  authRequired: boolean;
}

/**
 * A component with authentication configuration
 */
export type ComponentWithAuth<PropsType = any> = React.FC<PropsType> &
  AuthEnabledComponentConfig;

/**
 * NextJS page component that may contain the auth configuration
 */
export type NextComponentMaybeAuth = NextComponentType<
  NextPageContext,
  any,
  {}
> &
  Partial<AuthEnabledComponentConfig>;
