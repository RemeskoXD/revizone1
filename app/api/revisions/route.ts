import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.revisionCategory.findMany({
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, group: true, intervalMonths: true },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Get revision categories error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
