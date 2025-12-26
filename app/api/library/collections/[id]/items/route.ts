import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const { sampleId } = await request.json();

    if (!sampleId) {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      );
    }

    // Get current max order
    const maxOrder = await prisma.collectionItem.findFirst({
      where: { collectionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const item = await prisma.collectionItem.create({
      data: {
        collectionId,
        sampleId,
        order: (maxOrder?.order || 0) + 1,
      },
      include: {
        sample: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Sample already in collection' },
        { status: 409 }
      );
    }
    console.error('Error adding sample to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add sample to collection' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: collectionId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const sampleId = searchParams.get('sampleId');

    if (!sampleId) {
      return NextResponse.json(
        { error: 'Sample ID is required' },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
    });

    if (!collection || collection.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Collection not found or unauthorized' },
        { status: 404 }
      );
    }

    await prisma.collectionItem.deleteMany({
      where: {
        collectionId,
        sampleId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing sample from collection:', error);
    return NextResponse.json(
      { error: 'Failed to remove sample from collection' },
      { status: 500 }
    );
  }
}

