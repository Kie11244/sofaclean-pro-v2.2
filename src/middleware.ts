
import { NextResponse, type NextRequest } from 'next/server'

const locales = ['th', 'en']

// Get the preferred locale, similar to above or using a library
function getLocale(request: NextRequest) {
    // Check headers, cookies, etc. for preferred locale
    const acceptLanguage = request.headers.get('accept-language')
    const preferredLocale = acceptLanguage?.split(',')[0].split('-')[0] || 'th'
    return locales.includes(preferredLocale) ? preferredLocale : 'th';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for admin pages, API routes, and static files
  if (pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  
  return Response.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next).*)',
  ],
}
