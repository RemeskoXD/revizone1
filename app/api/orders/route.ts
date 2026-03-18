import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const role = session.user.role;
    const userId = session.user.id;

    // 1-day rule: Mark orders as public if assigned more than 24h ago and still PENDING
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.order.updateMany({
      where: {
        status: "PENDING",
        isPublic: false,
        assignedAt: {
          lt: oneDayAgo
        }
      },
      data: {
        isPublic: true,
        technicianId: null,
        companyId: null
      }
    });

    let orders;

    if (role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          customer: { select: { name: true, email: true } },
          technician: { select: { name: true, email: true } },
          company: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (role === "COMPANY_ADMIN") {
      orders = await prisma.order.findMany({
        where: { companyId: userId },
        include: {
          customer: { select: { name: true, email: true } },
          technician: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else if (role === "TECHNICIAN") {
      orders = await prisma.order.findMany({
        where: { technicianId: userId },
        include: {
          customer: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    } else {
      orders = await prisma.order.findMany({
        where: { customerId: userId },
        include: {
          technician: { select: { name: true, email: true } },
          company: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ message: "Chyba při načítání objednávek" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Neautorizováno" }, { status: 401 });
    }

    const { serviceType, propertyType, address, notes, reportFile, preferredDate } = await req.json();

    if (!serviceType || !propertyType || !address) {
      return NextResponse.json({ message: "Chybí povinné údaje" }, { status: 400 });
    }

    const readableId = `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    let price = 0;
    switch (serviceType) {
      case 'elektro_byt': price = 2500; break;
      case 'elektro_dum': price = 3500; break;
      case 'plyn': price = 1800; break;
      case 'hromosvod': price = 3000; break;
      case 'vlastni_revize': price = 0; break;
      default: price = 1500;
    }

    const orderData: any = {
      readableId,
      customerId: session.user.id,
      serviceType,
      propertyType,
      address,
      notes,
      price,
      status: serviceType === 'vlastni_revize' ? "COMPLETED" : "PENDING",
      reportFile: reportFile || null,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
    };

    if (serviceType !== 'vlastni_revize') {
      // Find the highest priority technician or company
      const highestPriorityUser = await prisma.user.findFirst({
        where: {
          role: { in: ['TECHNICIAN', 'COMPANY_ADMIN'] },
          // Could add logic here to check if they are available or in the same region
        },
        orderBy: {
          priority: 'desc',
        },
      });

      if (highestPriorityUser) {
        if (highestPriorityUser.role === 'TECHNICIAN') {
          orderData.technicianId = highestPriorityUser.id;
        } else if (highestPriorityUser.role === 'COMPANY_ADMIN') {
          orderData.companyId = highestPriorityUser.id;
        }
        orderData.assignedAt = new Date();
      } else {
        orderData.isPublic = true;
      }
    }

    const order = await prisma.order.create({
      data: orderData
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Chyba při vytváření objednávky" }, { status: 500 });
  }
}
