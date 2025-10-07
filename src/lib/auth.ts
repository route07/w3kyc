import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Check if user exists in database
          const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email }),
          });

          if (!response.ok) {
            return null;
          }

          const result = await response.json();
          if (!result.success || !result.user) {
            return null;
          }

          // Verify password using database service
          const { DatabaseUserService } = await import('@/lib/database-user-service');
          const isValidPassword = await DatabaseUserService.verifyPassword(credentials.email, credentials.password);
          if (!isValidPassword) {
            return null;
          }

          return {
            id: result.user.id,
            email: result.user.email,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            kycStatus: result.user.kycStatus,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.kycStatus = user.kycStatus;
        token.createdAt = user.createdAt;
        token.updatedAt = user.updatedAt;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.kycStatus = token.kycStatus as string;
        session.user.createdAt = token.createdAt as string;
        session.user.updatedAt = token.updatedAt as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/signup',
  },
  secret: process.env.NEXTAUTH_SECRET,
};