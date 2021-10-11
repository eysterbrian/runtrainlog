import React from 'react';
import { signIn, useSession } from 'next-auth/client';
import { Loading } from './Loading';

/**
 * Only shows child component once user is logged-in, and prompts
 * signin if user has not logged-in
 * @param children (required)
 * @returns JSX - either child component, loading status, or signin
 */
export const AuthRequired = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  const [session, loading] = useSession();
  const isUser = !!session?.user;

  React.useEffect(() => {
    // Do nothing while loading
    if (loading) return;

    // If not authenticated, force log in
    if (!isUser) signIn('google');
  }, [isUser, loading]);

  // User is logged-in, so show the child component
  if (isUser) {
    return children;
  }

  // Session is being fetched, or no user.
  // If no user, useEffect() will redirect.
  return <Loading />;
};

/**
 * Alternative approach is to create a HOC that wraps an auth-required component
 * with the same session logic.
 */
// export const withAuthRequired = (
//   component: NextComponentMaybeAuth
// ): NextComponentType<NextPageContext, any, {}> & AuthEnabledComponentConfig => {
//   const componentWithAuth: ComponentWithAuth = component;
//   componentWithAuth.authRequired = true;
//   return componentWithAuth;
// };
