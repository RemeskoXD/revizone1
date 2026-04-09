import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { orderConfirmationEmail } from "@/lib/email-templates";
import crypto from "crypto";

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

    const { serviceType, propertyType, address, notes, reportFile, preferredDate, revisionCategoryId } = await req.json();

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

    const cancelToken = crypto.randomBytes(24).toString('hex');

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
      revisionCategoryId: revisionCategoryId || null,
      cancelToken,
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
          if (highestPriorityUser.companyId) {
            orderData.companyId = highestPriorityUser.companyId;
          }
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

    if (serviceType !== 'vlastni_revize') {
      const customer = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, emailNotifications: true },
      });
      if (customer?.email && customer.emailNotifications) {
        const emailData = orderConfirmationEmail({
          readableId: order.readableId,
          serviceType: order.serviceType,
          address: order.address,
          price: order.price,
          preferredDate: order.preferredDate?.toISOString() || null,
          cancelToken,
        });
        sendMail({ to: customer.email, ...emailData }).catch(console.error);
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ message: "Chyba při vytváření objednávky" }, { status: 500 });
  }
}
