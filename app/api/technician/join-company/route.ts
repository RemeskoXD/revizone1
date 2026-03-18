import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    const company = await prisma.user.findUnique({
      where: { inviteCode }
    });

    if (!company || company.role !== 'COMPANY_ADMIN') {
      return NextResponse.json({ error: 'Neplatný kód firmy' }, { status: 404 });
    }

    // Check if already requested
    const existingRequest = await prisma.companyJoinRequest.findUnique({
      where: {
        technicianId_companyId: {
          technicianId: session.user.id,
          companyId: company.id
        }
      }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json({ error: 'Žádost již byla odeslána a čeká na schválení' }, { status: 400 });
      } else if (existingRequest.status === 'APPROVED') {
        return NextResponse.json({ error: 'Již jste členem této firmy' }, { status: 400 });
      } else {
        // If rejected, allow them to re-apply
        await prisma.companyJoinRequest.update({
          where: { id: existingRequest.id },
          data: { status: 'PENDING' }
        });
        return NextResponse.json({ success: true });
      }
    }

    await prisma.companyJoinRequest.create({
      data: {
        technicianId: session.user.id,
        companyId: company.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join company error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
