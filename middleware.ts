import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Optional: add custom logic here
    return undefined;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*'],
};
