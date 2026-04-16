import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type CheckResult = {
  name: string;
  status: 'ok' | 'error' | 'missing';
  message: string;
  details?: string;
};

function healthDetailToken(): string | undefined {
  return process.env.HEALTH_CHECK_SECRET || process.env.CRON_SECRET || undefined;
}

function canSeeDetailedHealth(req: Request): boolean {
  const expected = healthDetailToken();
  if (!expected) {
    return process.env.NODE_ENV !== 'production';
  }
  const url = new URL(req.url);
  const q = url.searchParams.get('secret');
  const auth = req.headers.get('authorization');
  const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  const candidate = bearer || q || '';
  if (candidate.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(candidate, 'utf8'), Buffer.from(expected, 'utf8'));
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  const detailed = canSeeDetailedHealth(req);

  if (!detailed) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return NextResponse.json({
        mode: 'minimal',
        status: 'ok',
        database: 'connected',
        hint:
          process.env.NODE_ENV === 'production'
            ? 'Pro úplnou diagnostiku nastavte HEALTH_CHECK_SECRET nebo CRON_SECRET a pošlete Authorization: Bearer <token>.'
            : 'Vývoj: celá diagnostika je dostupná bez tokenu, pokud není nastaven HEALTH_CHECK_SECRET ani CRON_SECRET.',
      });
    } catch {
      return NextResponse.json(
        { mode: 'minimal', status: 'error', database: 'disconnected', message: 'Databáze není dostupná' },
        { status: 503 }
      );
    }
  }

  const results: CheckResult[] = [];
  const isProd = process.env.NODE_ENV === 'production';

  try {
    await prisma.$queryRaw`SELECT 1`;
    results.push({ name: 'Připojení k databázi', status: 'ok', message: 'Databáze je dostupná' });
  } catch (e: unknown) {
    results.push({
      name: 'Připojení k databázi',
      status: 'error',
      message: 'Nelze se připojit k databázi',
      details: isProd ? undefined : e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ mode: 'detailed', results, summary: { ok: 0, error: 1, missing: 0 } }, { status: 503 });
  }

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
      const columns: unknown[] = await prisma.$queryRawUnsafe(
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

      const existingColumns = (columns as { COLUMN_NAME?: string; column_name?: string }[]).map(
        (c) => c.COLUMN_NAME || c.column_name
      );
      const missingColumns = check.requiredColumns.filter((col) => !existingColumns.includes(col));

      if (missingColumns.length > 0) {
        results.push({
          name: `Tabulka: ${check.table}`,
          status: 'error',
          message: `Chybí ${missingColumns.length} sloupců`,
          details: `Chybějící: ${missingColumns.join(', ')}`,
        });
      } else {
        const rowCount: { cnt?: number | bigint }[] = await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as cnt FROM \`${check.table}\``
        );
        const count = Number(rowCount[0]?.cnt ?? 0);
        results.push({
          name: `Tabulka: ${check.table}`,
          status: 'ok',
          message: `OK – ${existingColumns.length} sloupců, ${count} záznamů`,
        });
      }
    } catch (e: unknown) {
      results.push({
        name: `Tabulka: ${check.table}`,
        status: 'error',
        message: `Chyba při kontrole`,
        details: isProd ? undefined : e instanceof Error ? e.message?.slice(0, 200) : String(e).slice(0, 200),
      });
    }
  }

  try {
    const fks: unknown[] = await prisma.$queryRaw`
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
  } catch (e: unknown) {
    results.push({
      name: 'Cizí klíče (Foreign Keys)',
      status: 'error',
      message: 'Chyba při kontrole cizích klíčů',
      details: isProd ? undefined : e instanceof Error ? e.message?.slice(0, 200) : undefined,
    });
  }

  try {
    const indexes: unknown[] = await prisma.$queryRawUnsafe(
      `SHOW INDEX FROM \`Order\` WHERE Column_name = 'cancelToken' AND Non_unique = 0`
    );
    if (indexes.length > 0) {
      results.push({ name: 'Index: Order.cancelToken (UNIQUE)', status: 'ok', message: 'Unikátní index existuje' });
    } else {
      results.push({
        name: 'Index: Order.cancelToken (UNIQUE)',
        status: 'missing',
        message: 'Chybí unikátní index na cancelToken',
        details: 'ALTER TABLE `Order` ADD UNIQUE INDEX `Order_cancelToken_key`(`cancelToken`);',
      });
    }
  } catch {
    results.push({ name: 'Index: Order.cancelToken', status: 'error', message: 'Nelze ověřit' });
  }

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
    ok: results.filter((r) => r.status === 'ok').length,
    error: results.filter((r) => r.status === 'error').length,
    missing: results.filter((r) => r.status === 'missing').length,
  };

  return NextResponse.json({ mode: 'detailed', results, summary });
}
