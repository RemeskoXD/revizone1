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
    const { reportFile, revisionResult, revisionNotes, nextRevisionDate } = await req.json();

    const order = await prisma.order.findUnique({
      where: { readableId: id },
      include: { revisionCategory: true },
    });

    if (!order) {
      return NextResponse.json({ message: 'Objednávka nenalezena' }, { status: 404 });
    }

    if (order.technicianId !== session.user.id && order.companyId !== session.user.id) {
      return NextResponse.json({ message: 'Zakázka vám není přiřazena' }, { status: 403 });
    }

    if (order.status === 'COMPLETED') {
      return NextResponse.json({ message: 'Zakázka je již dokončena' }, { status: 400 });
    }

    if (!reportFile) {
      return NextResponse.json({ message: 'Revizní zpráva (PDF) je povinná' }, { status: 400 });
    }

    let autoNextRevision: Date | null = null;
    if (nextRevisionDate) {
      autoNextRevision = new Date(nextRevisionDate);
    } else if (order.revisionCategory?.intervalMonths) {
      autoNextRevision = new Date();
      autoNextRevision.setMonth(autoNextRevision.getMonth() + order.revisionCategory.intervalMonths);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        reportFile,
        revisionResult: revisionResult || 'PASS',
        revisionNotes: revisionNotes || null,
        nextRevisionDate: autoNextRevision,
        completedAt: new Date(),
      },
    });

    // Auto-create defect tasks if revision has issues
    if (revisionResult === 'FAIL' || revisionResult === 'PASS_WITH_NOTES') {
      const taskTitle = revisionResult === 'FAIL' 
        ? `⚠️ Revize nevyhovuje – ${order.serviceType}` 
        : `🔧 Revize s výhradami – ${order.serviceType}`;
      const taskDesc = revisionNotes || 'Technik zjistil závady. Podívejte se na revizní zprávu a zajistěte nápravu.';
      
      await prisma.defectTask.create({
        data: {
          orderId: order.id,
          userId: order.customerId,
          title: taskTitle,
          description: taskDesc,
          priority: revisionResult === 'FAIL' ? 'HIGH' : 'MEDIUM',
        },
      });
    }

    return NextResponse.json(updatedOrder, { status: 200 });
  } catch (error) {
    console.error('Complete order error:', error);
    return NextResponse.json({ message: 'Interní chyba serveru' }, { status: 500 });
  }
}
