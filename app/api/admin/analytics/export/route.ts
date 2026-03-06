import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import {
  buildAdminAnalyticsCsv,
  getAdminAnalyticsData,
  resolveAdminAnalyticsFilters,
} from "../shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return new Response("Forbidden: Admin access required", { status: 403 });
    }

    const filters = resolveAdminAnalyticsFilters(new URL(request.url).searchParams);
    const data = await getAdminAnalyticsData(filters);
    const csv = buildAdminAnalyticsCsv(data, filters);
    const fileDate = new Date().toISOString().slice(0, 10);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="analytics-export-${fileDate}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error exporting analytics:", error);
    return new Response("Failed to export analytics data", { status: 500 });
  }
}
