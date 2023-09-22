import crypto from 'crypto'
import { type GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './db'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      id: string
      role: string
      // ...other properties
      // role: UserRole;
    }
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin', // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },
  session: {
    // Use JSON Web Tokens for session instead of database sessions.
    // This option can be used with or without a database for users/accounts.
    // Note: `jwt` is automatically set to `true` if no database is specified.
    // jwt: true,

    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 30 * 24 * 60 * 60, // 30 days

    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    // updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    // A secret to use for key generation (you should set this explicitly)
    secret: process.env.NEXTAUTH_SECRET,
    // Set to true to use encryption (default: false)
    // encryption: true,
    // You can define your own encode/decode functions for signing and encryption
    // if you want to override the default behaviour.
    // encode: async ({ secret, token, maxAge }) => {},
    // decode: async ({ secret, token, maxAge }) => {},
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/require-await
    jwt: async ({ token, user }) => {
      // If successfully sign in, keep Firebase Authentication user info
      // in JWT payload
      if (user) {
        token = { ...token, ...user }
      }
      return token
    },

    // eslint-disable-next-line @typescript-eslint/require-await
    async session({ session, token }) {
      // add role to session
      session.user.role = token.role as string

      return session
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Email', type: 'email', placeholder: 'Your email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials.password) return null

        // query the user from the database
        const user = await prisma.user.findUnique({
          where: {
            email: credentials.username,
          },
        })

        if (!user) return null

        // check if the password is valid
        const isValid =
          crypto
            .scryptSync(credentials.password, user.salt as string, 64, {
              N: 1024,
            })
            .toString('hex') === user.hash

        if (!isValid) return null

        return user
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {},

  // Enable debug messages in the console if you are having problems
  debug: process.env.NODE_ENV !== 'production',
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
