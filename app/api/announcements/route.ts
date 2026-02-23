/**
 * Public Announcements API
 * Returns active announcements for the current user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/announcements - Get active announcements for current user
export async function GET(request: NextRequest) {
  const session = await auth();
  const user = session?.user;

  try {
    const now = new Date();

    // Build query for active announcements within date range
    const where: any = {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } },
      ],
    };

    // If user is logged in, filter by audience and dismissed status
    if (user?.id) {
      // Get user's account age for new_user filtering
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { createdAt: true },
      });

      const userCreatedAt = userData?.createdAt;
      const isNewUser = userCreatedAt 
        ? (now.getTime() - new Date(userCreatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 days
        : false;

      // Get dismissed announcements
      const dismissed = await prisma.announcementDismissal.findMany({
        where: { userId: user.id },
        select: { announcementId: true },
      });
      const dismissedIds = dismissed.map((d) => d.announcementId);

      // Add audience filter
      where.OR = [
        { audience: "all" },
        { audience: "specific_users", specificUserIds: { has: user.id } },
        ...(isNewUser ? [{ audience: "new_users" }] : []),
      ];

      // Exclude dismissed announcements
      if (dismissedIds.length > 0) {
        where.id = { notIn: dismissedIds };
      }
    } else {
      // For non-logged in users, only show "all" audience
      where.audience = "all";
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: [
        { priority: "desc" }, // high priority first
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: announcements });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}

// POST /api/announcements/dismiss - Dismiss an announcement
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { announcementId } = body;

    if (!announcementId) {
      return NextResponse.json(
        { error: "Announcement ID is required" },
        { status: 400 }
      );
    }

    // Create dismissal record
    await prisma.announcementDismissal.upsert({
      where: {
        userId_announcementId: {
          userId: session.user.id,
          announcementId,
        },
      },
      update: {}, // No update needed if exists
      create: {
        userId: session.user.id,
        announcementId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error dismissing announcement:", error);
    return NextResponse.json(
      { error: "Failed to dismiss announcement" },
      { status: 500 }
    );
  }
}
