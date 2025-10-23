import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          await connectDB();
          
          // Validate input
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          
          const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });
          
          if (!user) {
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return { 
            id: user._id, 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            uniqueId: user.uniqueId, 
            memberId: user.memberId 
          };
        } catch (error) {
          console.error('Authentication error:', error.message);
          return null;
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.uniqueId = user.uniqueId;
        token.memberId = user.memberId;
        token.sub = user.id; 
        
      }
      return token;
    },
    async session({ session, token }) {
        session.user.id = token.sub; 
        session.user.role = token.role;
        session.user.uniqueId = token.uniqueId;
        session.user.memberId = token.memberId;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  // Ensure proper URL handling in production
  debug: process.env.NODE_ENV === 'development',
};