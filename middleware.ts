import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Get the token from cookies
    const token = request.cookies.get('auth_token');

    const { pathname } = request.nextUrl;

    // Protect /dashboard and its sub-paths
    if (pathname.startsWith('/dashboard')) {
        if (!token) {
            // Redirect to login/home if no token is present
            return NextResponse.redirect(new URL('/', request.url));
        }
        // Note: To be fully secure, you should verify the token here.
        // However, verification using 'jsonwebtoken' in the Edge Runtime (Middleware) 
        // can be problematic due to Node.js dependencies.
        // For strict security, we rely on the API routes/Server Components to 
        // validate the token's signature content. This middleware serves as 
        // a first line of defense for routing.
    }

    // Allow the request to proceed
    const response = NextResponse.next();

    // Add Security Headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;"
    );
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/dashboard/:path*',
        '/ask',
    ],
};
