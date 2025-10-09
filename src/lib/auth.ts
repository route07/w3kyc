import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
          // Import database service
          const { DatabaseUserService } = await import('@/lib/database-user-service');
          
          // Find user in database
          const user = await DatabaseUserService.findByEmail(credentials.email);
          if (!user) {
            console.log('User not found:', credentials.email);
            return null;
          }

          // Verify password
          const isValidPassword = await DatabaseUserService.verifyPassword(credentials.email, credentials.password);
          if (!isValidPassword) {
            console.log('Invalid password for:', credentials.email);
            return null;
          }

          console.log('Authentication successful for:', credentials.email);

          return {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            kycStatus: user.kycStatus,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
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

// Auth utility functions
export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function generateToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
}

export async function authenticateRequest(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) {
    return null;
  }
  return await verifyToken(token);
}

export function withAuth(handler: any) {
  return async (request: NextRequest, context: any) => {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return handler(request, context, user);
  };
}

export function withAdminAuth(handler: any) {
  return async (request: NextRequest, context: any) => {
    const user = await authenticateRequest(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
    return handler(request, context, user);
  };
}