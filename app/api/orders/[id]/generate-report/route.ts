import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateReportHtml, type ReportData } from '@/lib/report-template';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['TECHNICIAN', 'COMPANY_ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const reportData: Partial<ReportData> = await req.json();

    const order = await prisma.order.findUnique({
      where: { readableId: id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        technician: { select: { name: true, phone: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.technicianId !== session.user.id && order.companyId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const fullData: ReportData = {
      orderReadableId: order.readableId,
      serviceType: order.serviceType,
      propertyType: order.propertyType,
      address: order.confirmedAddress || order.address,
      customerName: order.customer?.name || 'Neuvedeno',
      customerPhone: order.customer?.phone || 'Neuvedeno',
      customerEmail: order.customer?.email || 'Neuvedeno',
      technicianName: reportData.technicianName || order.technician?.name || session.user.name || 'Neuvedeno',
      technicianCert: reportData.technicianCert || '',
      technicianPhone: reportData.technicianPhone || order.technician?.phone || '',
      revisionDate: reportData.revisionDate || new Date().toLocaleDateString('cs-CZ'),
      nextRevisionDate: reportData.nextRevisionDate || '',
      result: reportData.result || 'PASS',
      standards: reportData.standards || 'ČSN 33 1500, ČSN 33 2000-6',
      checkpoints: reportData.checkpoints || [],
      measurements: reportData.measurements || [],
      defects: reportData.defects || [],
      notes: reportData.notes || '',
      conclusion: reportData.conclusion || '',
    };

    const html = generateReportHtml(fullData);

    return NextResponse.json({ html });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
