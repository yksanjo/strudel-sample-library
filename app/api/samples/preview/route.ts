import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Proxy the audio file to handle CORS
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Strudel-Sample-Library/1.0',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch audio file' },
          { status: response.status }
        );
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || 'audio/mpeg';

      return new NextResponse(arrayBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      // If direct fetch fails, return the URL for client-side loading
      return NextResponse.json({ url });
    }
  } catch (error) {
    console.error('Error previewing sample:', error);
    return NextResponse.json(
      { error: 'Failed to preview sample' },
      { status: 500 }
    );
  }
}


