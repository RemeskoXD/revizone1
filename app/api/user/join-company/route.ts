import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'TECHNICIAN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { companyCode } = await req.json();

    if (!companyCode) {
      return NextResponse.json({ message: 'Kód firmy je povinný' }, { status: 400 });
    }

    // Find the company by ID (using the code as ID for simplicity)
    const company = await prisma.user.findFirst({
      where: { 
        id: companyCode,
        role: 'COMPANY_ADMIN'
      },
    });

    if (!company) {
      return NextResponse.json({ message: 'Firma s tímto kódem nebyla nalezena' }, { status: 404 });
    }

    // Update the technician's companyId
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { companyId: company.id },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Join company error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
