import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { prisma } from "@/lib/prisma";
import { getSortedPostsData } from "@/lib/posts";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/tutoriales`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/cv`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  try {
    const posts = getSortedPostsData();
    entries.push(
      ...posts.map((post) => ({
        url: `${siteUrl}/posts/${post.id}`,
        lastModified: post.date ? new Date(post.date) : now,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }))
    );
  } catch (error) {
    console.error("sitemap posts error:", error);
  }

  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: { isPublished: true },
          orderBy: { order: "asc" },
          select: {
            slug: true,
            updatedAt: true,
          },
        },
      },
    });

    for (const course of courses) {
      entries.push({
        url: `${siteUrl}/tutoriales/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly",
        priority: 0.9,
      });

      for (const lesson of course.lessons) {
        entries.push({
          url: `${siteUrl}/tutoriales/${course.slug}/${lesson.slug}`,
          lastModified: lesson.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("sitemap courses error:", error);
  }

  return entries;
}
