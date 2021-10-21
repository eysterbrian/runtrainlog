import { Session, User } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
   */
  interface Session {
    // Uses module augmentation, so we're preserving the other top-level
    //    fields like 'expires'
    user: {
      id: string;
      name: string;
      email: string;
      image: string;
      fitbitId?: string;
    };
  }

  interface User {
    fitbitId?: string;
  }
}
