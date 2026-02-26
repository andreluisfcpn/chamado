/* eslint-disable no-unused-vars */
import NextAuth, { type DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    companyId?: string
    role?: string
  }

  interface Session {
    user: {
      id: string
      companyId?: string
      role?: string
    } & DefaultSession['user']
  }
}
