import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string || 'placeholder-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string || 'placeholder-secret',
    }),
  ],
  // Tạm giữ cho local testing. Trong thực tế Vercel sẽ yêu cầu NEXTAUTH_SECRET để mã hóa JWT.
  secret: process.env.NEXTAUTH_SECRET || 'tuy-y-chong-loi',
  callbacks: {
    async session({ session, token }) {
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
