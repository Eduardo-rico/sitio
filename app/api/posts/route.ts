import { NextResponse } from "next/server";
import { getSortedPostsData } from "@/lib/posts";

export async function GET() {
  try {
    const posts = getSortedPostsData();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
