import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

// Rutas que no requieren autenticación
const publicRoutes = ['/', '/api/login', '/api/empresa']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)

  // Obtener la sesión de las cookies
  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie).catch(() => null) : null

  // 1. Redirigir a login si no hay sesión y la ruta es privada
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  // 2. Redirigir al dashboard si hay sesión e intenta ir al login
  if (isPublicRoute && session && path === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  return NextResponse.next()
}

// Configurar qué rutas debe interceptar el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/login (explicity public)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images like logos)
     */
    '/((?!api/login|api/empresa|_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png|.*\\.jpg).*)',
  ],
}
