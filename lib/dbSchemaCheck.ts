import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

type ExpectedModel = {
  name: string;
  columns: { name: string; prismaType: string; isOptional: boolean; hasLongText?: boolean; hasText?: boolean }[];
};

const SCALAR_TYPES = new Set([
  "String",
  "Int",
  "Boolean",
  "Float",
  "DateTime",
  "Json",
  "BigInt",
  "Bytes",
]);

function parsePrismaSchema(schemaText: string): ExpectedModel[] {
  const lines = schemaText.split(/\r?\n/);
  const models: ExpectedModel[] = [];

  let current: ExpectedModel | null = null;

  const isStart = (line: string) => {
    const m = line.match(/^\s*model\s+(\w+)\s*\{\s*$/);
    return m ? m[1] : null;
  };

  for (let i = 0; i < lines.length; i++) {
    const startModelName = isStart(lines[i]);
    if (startModelName) {
      current = { name: startModelName, columns: [] };
      continue;
    }

    if (current) {
      const line = lines[i].replace(/\/\/.*$/, "").trim();
      if (!line) continue;
      if (line.startsWith("@@")) continue;
      if (line === "}") {
        models.push(current);
        current = null;
        continue;
      }

      // Field line example:
      //   id            String    @id @default(cuid())
      //   isDeleted     Boolean   @default(false)
      //   company       User?     @relation(...)
      //   technicians   User[]    @relation(...)
      const m = line.match(/^(\w+)\s+([^\s]+)(\s|$)(.*)$/);
      if (!m) continue;

      const fieldName = m[1];
      const typeTokenRaw = m[2]; // e.g. "String", "String?", "User[]", "DateTime?"
      const rest = m[4] || "";

      // Ignore list/relation backrefs like `orders Order[]` / `technicians User[]`
      if (typeTokenRaw.includes("[]")) continue;

      const isOptional = typeTokenRaw.endsWith("?");
      const baseType = typeTokenRaw.replace(/\?$/, "");

      if (!SCALAR_TYPES.has(baseType)) continue;

      current.columns.push({
        name: fieldName,
        prismaType: baseType,
        isOptional,
        hasLongText: rest.includes("@db.LongText"),
        hasText: rest.includes("@db.Text"),
      });
    }
  }

  return models;
}

export async function checkDatabaseSchema(): Promise<{
  databaseName: string | null;
  checkedAt: string;
  missingTables: string[];
  missingColumnsByTable: Record<string, string[]>;
  expectedModelsCount: number;
  existingTablesCount: number;
}> {
  const prismaSchemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
  let schemaText: string;
  try {
    schemaText = fs.readFileSync(prismaSchemaPath, "utf8");
  } catch (e: any) {
    throw new Error(
      `Nepodařilo se přečíst prisma schema: ${prismaSchemaPath}. ` +
        `Zkontroluj, že se soubor deployuje spolu s aplikací. Původní chyba: ${e?.message ?? e}`
    );
  }
  const expectedModels = parsePrismaSchema(schemaText);

  const dbRows = (await prisma.$queryRaw<{ dbName: string }[]>`
    SELECT DATABASE() as dbName
  `) as { dbName: string }[];
  const databaseName = dbRows?.[0]?.dbName ?? null;

  if (!databaseName) {
    throw new Error("Nelze zjistit aktuální databázi (DATABASE() je null).");
  }

  const modelNames = expectedModels.map((m) => m.name);

  const columnsRows = (await prisma.$queryRaw<
    { TABLE_NAME: string; COLUMN_NAME: string }[]
  >`
    SELECT TABLE_NAME, COLUMN_NAME
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = ${databaseName}
  `) as { TABLE_NAME: string; COLUMN_NAME: string }[];

  const tablesRows = (await prisma.$queryRaw<{ TABLE_NAME: string }[]>`
    SELECT TABLE_NAME
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = ${databaseName}
  `) as { TABLE_NAME: string }[];

  const existingTablesSet = new Set(tablesRows.map((r) => r.TABLE_NAME.toLowerCase()));
  const existingColumnsByTable: Record<string, Set<string>> = {};

  for (const r of columnsRows) {
    const t = r.TABLE_NAME.toLowerCase();
    if (!existingColumnsByTable[t]) existingColumnsByTable[t] = new Set();
    existingColumnsByTable[t].add(r.COLUMN_NAME.toLowerCase());
  }

  const missingTables: string[] = [];
  const missingColumnsByTable: Record<string, string[]> = {};

  for (const model of expectedModels) {
    if (!existingTablesSet.has(model.name.toLowerCase())) {
      missingTables.push(model.name);
      continue;
    }

    const existingCols =
      existingColumnsByTable[model.name.toLowerCase()] ?? new Set<string>();
    const missingCols = model.columns
      .map((c) => c.name)
      .filter((col) => !existingCols.has(col.toLowerCase()));

    if (missingCols.length > 0) {
      missingColumnsByTable[model.name] = missingCols;
    }
  }

  return {
    databaseName,
    checkedAt: new Date().toISOString(),
    missingTables,
    missingColumnsByTable,
    expectedModelsCount: expectedModels.length,
    existingTablesCount: existingTablesSet.size,
  };
}

