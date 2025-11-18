import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { Adapter } from "next-auth/adapters"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Add user role to session
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        session.user.role = dbUser?.role || "VIEWER"
      }
      return session
    },
    async signIn({ account, profile }) {
      if (!profile?.email) {
        return false
      }

      // Optional: Whitelist specific email domains or emails
      // Uncomment and modify as needed:
      // const allowedDomains = ["yourdomain.com"]
      // const allowedEmails = ["user@example.com"]
      // const emailDomain = profile.email.split("@")[1]
      // if (!allowedDomains.includes(emailDomain) && !allowedEmails.includes(profile.email)) {
      //   return false
      // }

      // Update last login
      await prisma.user.update({
        where: { email: profile.email },
        data: { lastLogin: new Date() },
      }).catch(() => {
        // User might not exist yet, that's okay
      })

      return true
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the built-in session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
