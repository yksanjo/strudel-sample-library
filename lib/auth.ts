import { headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';

// Helper to get session from request headers
export async function auth() {
  try {
    const headersList = await headers();

    // Get the session token; getToken reads the JWT from the cookie header
    const token = await getToken({
      req: { headers: headersList },
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) return null;

    // Return a session-like object
    return {
      user: {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        image: token.picture as string,
      },
    };
  } catch {
    return null;
  }
}
