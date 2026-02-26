import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (pathname === '/') {
    if (token) {
      const userRole = token.role as string
      const dashboardPath = new URL(getRoleBasedPath(userRole), request.url)
      return NextResponse.redirect(dashboardPath)
    }
    return NextResponse.next()
  }

  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }

    const userRole = token.role as string
    const isOnCorrectPath = pathname.includes(getRoleBasedPath(userRole))

    if (!isOnCorrectPath && pathname !== '/dashboard') {
      const correctPath = new URL(getRoleBasedPath(userRole), request.url)
      return NextResponse.redirect(correctPath)
    }
  }

  return NextResponse.next()
}

function getRoleBasedPath(role: string): string {
  const rolePaths = {
    ADMINISTRADOR: '/dashboard/administrador',
    ATENDENTE: '/dashboard/atendente',
    ADMINISTRADOR_EMPRESA: '/dashboard/empresa',
    CLIENTE: '/dashboard/cliente',
  }

  return rolePaths[role as keyof typeof rolePaths] || '/dashboard'
}

export const config = {
  matcher: ['/', '/dashboard/:path*'],
}
