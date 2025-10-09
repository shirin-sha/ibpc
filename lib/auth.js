import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from './db';
import User from './models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (user && await bcrypt.compare(credentials.password, user.password)) {
          return { id: user._id, name: user.name, email: user.email, role: user.role, uniqueId: user.uniqueId, memberId: user.memberId };
        }
        return null;
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
};