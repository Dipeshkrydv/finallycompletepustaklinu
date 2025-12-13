
import NextAuthModule from 'next-auth';
const NextAuth = NextAuthModule.default || NextAuthModule;
import CredentialsProviderModule from 'next-auth/providers/credentials';

const CredentialsProvider = CredentialsProviderModule.default || CredentialsProviderModule;
import GoogleProviderModule from 'next-auth/providers/google';
import FacebookProviderModule from 'next-auth/providers/facebook';

const GoogleProvider = GoogleProviderModule.default || GoogleProviderModule;
const FacebookProvider = FacebookProviderModule.default || FacebookProviderModule;
import bcrypt from 'bcrypt';
import { User } from '@/models/index';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('DEBUG AUTH: Attempting login for:', credentials?.identifier);

        if (!credentials?.identifier || !credentials?.password) {
          console.log('DEBUG AUTH: Missing credentials');
          throw new Error('Please enter email/phone and password');
        }

        const { Op } = require('sequelize');
        const user = await User.findOne({
          where: {
            [Op.or]: [
              { email: credentials.identifier },
              { phone: credentials.identifier }
            ]
          }
        });

        if (!user || !user.password) {
          console.log('DEBUG AUTH: User not found or no password');
          throw new Error('No user found with this email or phone number');
        }

        console.log('DEBUG AUTH: User found, comparing password');
        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.log('DEBUG AUTH: Invalid password');
          throw new Error('Invalid password');
        }

        console.log('DEBUG AUTH: Login successful for user', user.id);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock_secret',
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || 'mock_id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'mock_secret',
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google' || account.provider === 'facebook') {
        try {
          const existingUser = await User.findOne({ where: { email: user.email } });
          if (!existingUser) {
            // Create new user with minimal info
            await User.create({
              name: user.name,
              email: user.email,
              role: '', // Empty role triggers profile completion
              phone: null, // Null phone triggers profile completion
            });
          }
          return true;
        } catch (error) {
          console.error("Error in social sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Validating user from DB to ensure we have latest role/phone
      if (token.email) {
        const dbUser = await User.findOne({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.requiresProfileCompletion = !dbUser.role || !dbUser.phone;
        }
      }

      // Handle updates from client side
      if (trigger === "update" && session) {
        return { ...token, ...session.user };
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.requiresProfileCompletion = token.requiresProfileCompletion;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
