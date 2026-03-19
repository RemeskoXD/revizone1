import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect('/login');
  if (session.user.role === 'PRODUCT_MANAGER') redirect('/product-manager');
  if (['ADMIN', 'SUPPORT', 'CONTRACTOR'].includes(session.user.role)) redirect('/admin');
  if (session.user.role === 'COMPANY_ADMIN') redirect('/company');
  if (session.user.role === 'TECHNICIAN') redirect('/technician');
  if (session.user.role === 'REALTY') redirect('/realty');

  const SERVER_ENDPOINT =
    "http://127.0.0.1:7544/ingest/a510c46c-47be-4be7-954a-7df072cc1575";
  const DEBUG_SESSION_ID = "11bedb";

  // #region agent log - dashboard start
  await fetch(SERVER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": DEBUG_SESSION_ID,
    },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: "pre-dash-500",
      hypothesisId: "H2",
      location: "app/dashboard/page.tsx:start",
      message: "DashboardPage session loaded",
      data: {
        hasSession: !!session,
        userId: session?.user?.id ?? null,
        role: session?.user?.role ?? null,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  let recentOrders: any[] = [];
  let activeOrdersCount = 0;
  let completedOrdersCount = 0;
  let completedOrders: any[] = [];
  let defectTasks: any[] = [];

  try {
    // #region agent log - recentOrders query
    recentOrders = await prisma.order.findMany({
      where: { customerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { revisionCategory: true },
    });
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H1",
        location: "app/dashboard/page.tsx:recentOrders",
        message: "recentOrders loaded",
        data: {
          count: recentOrders?.length ?? 0,
          firstCreatedAtType:
            recentOrders?.[0]?.createdAt
              ? Object.prototype.toString.call(recentOrders[0].createdAt)
              : null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    activeOrdersCount = await prisma.order.count({
      where: {
        customerId: session.user.id,
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
    });
    // #region agent log - activeOrdersCount query
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H1",
        location: "app/dashboard/page.tsx:activeOrdersCount",
        message: "activeOrdersCount loaded",
        data: { value: activeOrdersCount },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    completedOrdersCount = await prisma.order.count({
      where: { customerId: session.user.id, status: "COMPLETED" },
    });
    // #region agent log - completedOrdersCount query
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H1",
        location: "app/dashboard/page.tsx:completedOrdersCount",
        message: "completedOrdersCount loaded",
        data: { value: completedOrdersCount },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    completedOrders = await prisma.order.findMany({
      where: { customerId: session.user.id, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      include: { revisionCategory: true },
    });
    // #region agent log - completedOrders query
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H1",
        location: "app/dashboard/page.tsx:completedOrders",
        message: "completedOrders loaded",
        data: { count: completedOrders?.length ?? 0 },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    defectTasks = await prisma.defectTask.findMany({
      where: { userId: session.user.id, status: { not: "RESOLVED" } },
      include: {
        order: { select: { readableId: true, serviceType: true, address: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
    // #region agent log - defectTasks query
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H4",
        location: "app/dashboard/page.tsx:defectTasks",
        message: "defectTasks loaded",
        data: { count: defectTasks?.length ?? 0 },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
  } catch (error: any) {
    // #region agent log - dashboard query error
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "pre-dash-500",
        hypothesisId: "H1",
        location: "app/dashboard/page.tsx:queryError",
        message: "DashboardPage prisma query failed",
        data: {
          name: error?.name ?? null,
          // avoid dumping stack; message includes column missing, which is useful for debugging
          errorMessage: error?.message ?? String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    throw error;
  }

  const now = new Date();
  const watchdogItems = completedOrders.map((order) => {
    const months = order.revisionCategory?.intervalMonths || 36;
    const completedDate = order.completedAt ? new Date(order.completedAt) : new Date(order.updatedAt);
    const expires = new Date(completedDate);
    expires.setMonth(expires.getMonth() + months);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: order.id,
      readableId: order.readableId,
      serviceType: order.serviceType,
      address: order.address,
      completedAt: completedDate.toISOString(),
      expiresAt: expires.toISOString(),
      daysLeft,
      categoryName: order.revisionCategory?.name || null,
      result: order.revisionResult,
      hasReport: !!order.reportFile,
      status: daysLeft <= 0 ? 'expired' : daysLeft <= 90 ? 'warning' : daysLeft <= 180 ? 'soon' : 'ok',
    };
  }).sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <DashboardClient 
      user={session.user} 
      recentOrders={recentOrders}
      activeOrdersCount={activeOrdersCount} 
      completedOrdersCount={completedOrdersCount}
      watchdogItems={watchdogItems}
      defectTasks={defectTasks}
    />
  );
}
