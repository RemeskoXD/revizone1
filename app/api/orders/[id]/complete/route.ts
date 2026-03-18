import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['TECHNICIAN', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { reportFile } = await req.json(); // Expecting base64 string
    
    // Find the order
    const order = await prisma.order.findUnique({
      where: { readableId: id },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.technicianId !== session.user.id && order.companyId !== session.user.id) {
      return NextResponse.json({ message: 'Order is not assigned to you' }, { status: 403 });
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Order is already completed' }, { status: 400 });
    }

    // Mark as completed and save the report file
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        status: 'COMPLETED',
        reportFile: reportFile || null
      },
    });

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Complete order error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
