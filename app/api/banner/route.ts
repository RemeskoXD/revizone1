import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const banner = await prisma.systemConfig.findUnique({ where: { key: 'global_banner' } });
    const bannerType = await prisma.systemConfig.findUnique({ where: { key: 'global_banner_type' } });

    if (!banner?.value) {
      return NextResponse.json({ message: '', type: 'info' });
    }

    return NextResponse.json({ message: banner.value, type: bannerType?.value || 'info' });
  } catch {
    return NextResponse.json({ message: '', type: 'info' });
  }
}
