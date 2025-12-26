import { NextRequest, NextResponse } from 'next/server';
import { discoverSamplesFromGitHub } from '@/lib/services/github-service';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const source = searchParams.get('source') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');

    let samples = [];

    if (source === 'github' || source === 'all') {
      // Search GitHub for samples
      const githubSamples = await discoverSamplesFromGitHub(query, 10);
      samples.push(...githubSamples);
    }

    if (source === 'upload' || source === 'all') {
      // Get uploaded samples from database
      const where: any = { isPublic: true };
      if (query) {
        where.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }
      if (category) {
        where.category = category;
      }

      const dbSamples = await prisma.sample.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      samples.push(
        ...dbSamples.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          filePath: s.filePath,
          sourceUrl: s.sourceUrl || s.filePath,
          source: s.source,
          bpm: s.bpm,
          key: s.key,
          tags: s.tags ? JSON.parse(s.tags) : [],
          author: s.author || s.uploadedBy?.name,
          category: s.category,
          duration: s.duration,
          metadata: s.metadata ? JSON.parse(s.metadata) : {},
        }))
      );
    }

    // Filter by category if specified
    if (category && source === 'all') {
      samples = samples.filter((s) => s.category === category);
    }

    return NextResponse.json({ samples: samples.slice(0, limit) });
  } catch (error) {
    console.error('Error searching samples:', error);
    return NextResponse.json(
      { error: 'Failed to search samples' },
      { status: 500 }
    );
  }
}

