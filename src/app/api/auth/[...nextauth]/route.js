
import NextAuthModule from 'next-auth';
const NextAuth = NextAuthModule.default || NextAuthModule;
import CredentialsProviderModule from 'next-auth/providers/credentials';

const CredentialsProvider = CredentialsProviderModule.default || CredentialsProviderModule;
import { Op } from 'sequelize';
import bcrypt from 'bcryptjs';
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
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error('Please enter email/phone and password');
        }

        // Op imported at top level
        const user = await User.findOne({
          where: {
            [Op.or]: [
              { email: credentials.identifier },
              { phone: credentials.identifier }
            ]
          }
        });

        if (!user || !user.password) {
          throw new Error('No user found with this email or phone number');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid password');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Validating user from DB to ensure we have latest role/phone
      if (token.email) {
        const dbUser = await User.findOne({ where: { email: token.email } });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.phone = dbUser.phone;
          token.address = dbUser.address;
          token.city = dbUser.city;
          token.province = dbUser.province;
          token.requiresProfileCompletion = !dbUser.role || !dbUser.phone || !dbUser.address;
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
        session.user.phone = token.phone;
        session.user.address = token.address;
        session.user.city = token.city;
        session.user.province = token.province;
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
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
      },
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
