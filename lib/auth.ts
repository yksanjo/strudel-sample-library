import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies, headers } from 'next/headers';
import { getToken } from 'next-auth/jwt';

// Helper to get session from cookies/headers
export async function auth() {
  try {
    const cookieStore = await cookies();
    const headersList = await headers();
    
    // Get the session token from cookies
    const token = await getToken({
      req: {
        headers: Object.fromEntries(headersList.entries()),
        cookies: Object.fromEntries(
          cookieStore.getAll().map(c => [c.name, c.value])
        ),
      } as any,
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

