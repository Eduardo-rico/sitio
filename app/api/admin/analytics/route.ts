import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { ApiResponse } from "@/types";
import {
  getAdminAnalyticsData,
  resolveAdminAnalyticsFilters,
  type AdminAnalyticsData,
} from "./shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/admin/analytics - Get detailed analytics data (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return Response.json(
        { success: false, error: "Forbidden: Admin access required" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const filters = resolveAdminAnalyticsFilters(new URL(request.url).searchParams);
    const data = await getAdminAnalyticsData(filters);

    return Response.json({
      success: true,
      data,
    } satisfies ApiResponse<AdminAnalyticsData>);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { success: false, error: "Failed to fetch analytics data" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
