/* eslint-disable no-unused-vars */
declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string

    NEXTAUTH_URL: string
    NEXT_PUBLIC_BASE_URL: string
    NEXTAUTH_SECRET: string

    NEXT_GOOGLE_SMPT_HOST: string
    NEXT_GOOGLE_SMPT_USER: string
    NEXT_GOOGLE_SMPT_PASS: string

    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: string
    CLOUDINARY_API_KEY: string
    CLOUDINARY_API_SECRET: string

    NEXT_APP_VERSION: string
  }
}
