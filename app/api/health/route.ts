import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type CheckResult = {
  name: string;
  status: 'ok' | 'error' | 'missing';
  message: string;
  details?: string;
};

export async function GET() {
  const results: CheckResult[] = [];
  let dbConnected = false;

  // 1. Database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: 'Připojení k databázi', status: 'ok', message: 'Databáze je dostupná' });
    dbConnected = true;
  } catch (e: any) {
    results.push({ name: 'Připojení k databázi', status: 'error', message: 'Nelze se připojit k databázi', details: e.message });
    return NextResponse.json({ results, summary: { ok: 0, error: 1, missing: 0 } });
  }

  // 2. Check each table exists and has correct columns
  const tableChecks: { table: string; requiredColumns: string[] }[] = [
    {
      table: 'User',
      requiredColumns: ['id', 'name', 'email', 'emailVerified', 'password', 'phone', 'role', 'isDeleted', 'priority', 'emailNotifications', 'companyId', 'inviteCode', 'commissionRate', 'createdAt', 'updatedAt'],
    },
    {
      table: 'Order',
      requiredColumns: ['id', 'readableId', 'isDeleted', 'customerId', 'technicianId', 'companyId', 'propertyId', 'revisionCategoryId', 'serviceType', 'propertyType', 'address', 'notes', 'status', 'assignedAt', 'isPublic', 'reportFile', 'price', 'preferredDate', 'scheduledDate', 'scheduledNote', 'confirmedAddress', 'revisionResult', 'revisionNotes', 'nextRevisionDate', 'completedAt', 'cancelToken', 'lastExpiryEmailDays', 'createdAt', 'updatedAt'],
    },
    {
      table: 'RoleRequest',
      requiredColumns: ['id', 'userId', 'requestedRole', 'status', 'createdAt', 'updatedAt'],
    },
    {
      table: 'CompanyJoinRequest',
      requiredColumns: ['id', 'technicianId', 'companyId', 'status', 'createdAt', 'updatedAt'],
    },
    {
      table: 'DocumentTransfer',
      requiredColumns: ['id', 'senderId', 'receiverId', 'documentId', 'status', 'createdAt', 'updatedAt'],
    },
    {
      table: 'RevisionCategory',
      requiredColumns: ['id', 'name', 'group', 'intervalMonths', 'legalBasis', 'description', 'createdAt', 'updatedAt'],
    },
    {
      table: 'Property',
      requiredColumns: ['id', 'name', 'address', 'description', 'ownerId', 'transferToken', 'transferStatus', 'claimedById', 'createdAt', 'updatedAt'],
    },
    {
      table: 'ActivityLog',
      requiredColumns: ['id', 'userId', 'action', 'details', 'targetId', 'createdAt'],
    },
    {
      table: 'ChecklistItem',
      requiredColumns: ['id', 'orderId', 'text', 'isCompleted', 'createdAt', 'updatedAt'],
    },
    {
      table: 'Message',
      requiredColumns: ['id', 'orderId', 'senderId', 'content', 'createdAt'],
    },
    {
      table: 'DefectTask',
      requiredColumns: ['id', 'orderId', 'userId', 'title', 'description', 'status', 'priority', 'createdAt', 'updatedAt'],
    },
    {
      table: 'ShareLink',
      requiredColumns: ['id', 'token', 'userId', 'label', 'orderIds', 'expiresAt', 'isActive', 'viewCount', 'createdAt'],
    },
    {
      table: 'SystemConfig',
      requiredColumns: ['id', 'key', 'value', 'label', 'updatedAt'],
    },
    {
      table: 'Notification',
      requiredColumns: ['id', 'userId', 'type', 'title', 'message', 'link', 'isRead', 'createdAt'],
    },
    {
      table: 'Review',
      requiredColumns: ['id', 'orderId', 'customerId', 'technicianId', 'rating', 'comment', 'createdAt'],
    },
    {
      table: 'OrderPhoto',
      requiredColumns: ['id', 'orderId', 'imageData', 'caption', 'uploadedBy', 'createdAt'],
    },
    {
      table: 'EmailLog',
      requiredColumns: ['id', 'to', 'subject', 'type', 'status', 'messageId', 'error', 'orderId', 'userId', 'createdAt'],
    },
  ];

  for (const check of tableChecks) {
    try {
      const columns: any[] = await prisma.$queryRawUnsafe(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${check.table}'`
      );

      if (columns.length === 0) {
        results.push({
          name: `Tabulka: ${check.table}`,
          status: 'missing',
          message: `Tabulka "${check.table}" NEEXISTUJE`,
          details: `Vytvořte tabulku pomocí SQL z dokumentace.`,
        });
        continue;
      }

      const existingColumns = columns.map((c: any) => c.COLUMN_NAME || c.column_name);
      const missingColumns = check.requiredColumns.filter(col => !existingColumns.includes(col));

      if (missingColumns.length > 0) {
        results.push({
          name: `Tabulka: ${check.table}`,
          status: 'error',
          message: `Chybí ${missingColumns.length} sloupců`,
          details: `Chybějící: ${missingColumns.join(', ')}`,
        });
      } else {
        const rowCount: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as cnt FROM \`${check.table}\``);
        const count = Number(rowCount[0]?.cnt ?? 0);
        results.push({
          name: `Tabulka: ${check.table}`,
          status: 'ok',
          message: `OK – ${existingColumns.length} sloupců, ${count} záznamů`,
        });
      }
    } catch (e: any) {
      results.push({
        name: `Tabulka: ${check.table}`,
        status: 'error',
        message: `Chyba při kontrole`,
        details: e.message?.slice(0, 200),
      });
    }
  }

  // 3. Check foreign keys
  try {
    const fks: any[] = await prisma.$queryRaw`
      SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY TABLE_NAME
    `;
    results.push({
      name: 'Cizí klíče (Foreign Keys)',
      status: 'ok',
      message: `Nalezeno ${fks.length} cizích klíčů`,
    });
  } catch (e: any) {
    results.push({
      name: 'Cizí klíče (Foreign Keys)',
      status: 'error',
      message: 'Chyba při kontrole cizích klíčů',
      details: e.message?.slice(0, 200),
    });
  }

  // 4. Check indexes on Order
  try {
    const indexes: any[] = await prisma.$queryRawUnsafe(
      `SHOW INDEX FROM \`Order\` WHERE Column_name = 'cancelToken' AND Non_unique = 0`
    );
    if (indexes.length > 0) {
      results.push({ name: 'Index: Order.cancelToken (UNIQUE)', status: 'ok', message: 'Unikátní index existuje' });
    } else {
      results.push({ name: 'Index: Order.cancelToken (UNIQUE)', status: 'missing', message: 'Chybí unikátní index na cancelToken', details: "ALTER TABLE `Order` ADD UNIQUE INDEX `Order_cancelToken_key`(`cancelToken`);" });
    }
  } catch {
    results.push({ name: 'Index: Order.cancelToken', status: 'error', message: 'Nelze ověřit' });
  }

  // 5. Env variables check
  const envChecks = [
    { key: 'DATABASE_URL', required: true },
    { key: 'NEXTAUTH_SECRET', required: true },
    { key: 'NEXTAUTH_URL', required: true },
    { key: 'SMTP_HOST', required: false },
    { key: 'SMTP_USER', required: false },
    { key: 'SMTP_PASS', required: false },
    { key: 'SMTP_FROM', required: false },
    { key: 'CRON_SECRET', required: false },
  ];

  for (const env of envChecks) {
    const value = process.env[env.key];
    if (value) {
      results.push({ name: `ENV: ${env.key}`, status: 'ok', message: 'Nastaveno' });
    } else {
      results.push({
        name: `ENV: ${env.key}`,
        status: env.required ? 'error' : 'missing',
        message: env.required ? 'CHYBÍ – povinná proměnná!' : 'Nenastaveno (volitelné)',
      });
    }
  }

  const summary = {
    ok: results.filter(r => r.status === 'ok').length,
    error: results.filter(r => r.status === 'error').length,
    missing: results.filter(r => r.status === 'missing').length,
  };

  return NextResponse.json({ results, summary });
}
