import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const tags = formData.get('tags') as string;
    const bpm = formData.get('bpm') as string;
    const key = formData.get('key') as string;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type) && !/\.(wav|mp3|ogg|webm)$/i.test(file.name)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only audio files are allowed.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', session.user.id);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = join(uploadsDir, filename);
    const publicPath = `/uploads/${session.user.id}/${filename}`;

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get audio duration (simplified - in production, use proper audio analysis)
    let duration: number | null = null;
    try {
      const audio = new Audio();
      const audioUrl = `${request.nextUrl.origin}${publicPath}`;
      // Note: This is a simplified approach. In production, analyze the file server-side
      duration = null; // Will be set client-side or via background job
    } catch (error) {
      console.error('Error getting audio duration:', error);
    }

    // Create sample record
    const sample = await prisma.sample.create({
      data: {
        name: name || file.name,
        description: description || null,
        filePath: publicPath,
        sourceUrl: `${request.nextUrl.origin}${publicPath}`,
        source: 'upload',
        category: category || null,
        tags: tags ? JSON.stringify(tags.split(',').map(t => t.trim())) : null,
        bpm: bpm ? parseInt(bpm) : null,
        key: key || null,
        duration: duration,
        uploadedById: session.user.id,
        isPublic: isPublic,
      },
      include: {
        uploadedBy: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ sample });
  } catch (error) {
    console.error('Error uploading sample:', error);
    return NextResponse.json(
      { error: 'Failed to upload sample' },
      { status: 500 }
    );
  }
}

