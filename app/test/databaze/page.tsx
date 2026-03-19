import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkDatabaseSchema } from "@/lib/dbSchemaCheck";

export default async function DatabaseTestPage() {
  const session = await getServerSession(authOptions);

  // Security: show only to admins/support (so customers can't inspect DB structure).
  const role = session?.user?.role;
  if (!session || !["ADMIN", "SUPPORT"].includes(role as string)) {
    redirect("/login");
  }

  const SERVER_ENDPOINT =
    "http://127.0.0.1:7544/ingest/a510c46c-47be-4be7-954a-7df072cc1575";
  const DEBUG_SESSION_ID = "11bedb";

  let report: Awaited<ReturnType<typeof checkDatabaseSchema>>;
  try {
    report = await checkDatabaseSchema();
  } catch (e: any) {
    // #region agent log - databaze page error
    await fetch(SERVER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": DEBUG_SESSION_ID,
      },
      body: JSON.stringify({
        sessionId: DEBUG_SESSION_ID,
        runId: "dbtest-error",
        hypothesisId: "H0",
        location: "app/test/databaze/page.tsx",
        message: "checkDatabaseSchema failed",
        data: { errorMessage: e?.message ?? String(e) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    return (
      <main className="min-h-screen p-6 bg-[#111111] text-white">
        <div className="max-w-3xl mx-auto space-y-2">
          <h1 className="text-2xl font-bold">Test databáze</h1>
          <p className="text-red-400">
            Nepodařilo se načíst report databáze. {e?.message ?? ""}
          </p>
        </div>
      </main>
    );
  }

  const summaryLine = report.missingTables.length
    ? `Chybí tabulky: ${report.missingTables.length}`
    : `Tabulky v pořádku (${report.existingTablesCount}/${report.expectedModelsCount})`;

  const missingColsTotal = Object.values(report.missingColumnsByTable).reduce(
    (sum, arr) => sum + arr.length,
    0
  );

  return (
    <main className="min-h-screen p-6 bg-[#111111] text-white">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Test databáze</h1>
        <div className="text-sm text-gray-300">
          {summaryLine} • Chybějící sloupce: {missingColsTotal}
        </div>

        <div className="bg-[#1A1A1A] border border-white/10 rounded-xl p-4 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(report, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  );
}

