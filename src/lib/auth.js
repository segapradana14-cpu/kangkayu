import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions = {
  session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Email dan Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = (credentials?.email || '').trim().toLowerCase();
        const password = credentials?.password || '';
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const cocok = await bcrypt.compare(password, user.password);
        if (!cocok) return null;

        return { id: String(user.id), name: user.nama, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    // Simpan id dan peran ke token, lalu ke session agar bisa dipakai di halaman.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
