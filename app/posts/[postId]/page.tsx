import getFormattedDate from "@/lib/getFormattedDate";
import { getSortedPostsData, getPostData } from "@/lib/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export function generateStaticParams() {
  const posts = getSortedPostsData();

  return posts.map((post) => ({
    postId: post.id,
  }));
}

export function generateMetadata({ params }: { params: { postId: string } }): Metadata {
  const posts = getSortedPostsData();
  const { postId } = params;
  const siteUrl = getSiteUrl();

  const post = posts.find((post) => post.id === postId);

  if (!post) {
    return {
      title: "Post no encontrado",
    };
  }

  return {
    title: post.title,
    description: `Artículo técnico: ${post.title}`,
    alternates: {
      canonical: `/posts/${post.id}`,
    },
    openGraph: {
      type: "article",
      url: `${siteUrl}/posts/${post.id}`,
      title: post.title,
      description: `Artículo técnico: ${post.title}`,
      publishedTime: post.date,
    },
  };
}

export default async function Post({ params }: { params: { postId: string } }) {
  const posts = getSortedPostsData();
  const { postId } = params;
  const siteUrl = getSiteUrl();

  if (!posts.find((post) => post.id === postId)) notFound();

  const { title, date, contentHtml } = await getPostData(postId);

  const pubDate = getFormattedDate(date);
  const postSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    datePublished: date,
    dateModified: date,
    author: {
      "@type": "Person",
      name: "Eduardo Rico Sotomayor",
      url: `${siteUrl}/cv`,
    },
    publisher: {
      "@type": "Person",
      name: "Eduardo Rico Sotomayor",
    },
    url: `${siteUrl}/posts/${postId}`,
    inLanguage: "es",
  };

  return (
    <main className="px-6 prose prose-xl prose-slate dark:prose-invert mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postSchema) }}
      />
      <h1 className="text-3xl mt-4 mb-0">{title}</h1>
      <p className="mt-0">{pubDate}</p>
      <article>
        <section dangerouslySetInnerHTML={{ __html: contentHtml }} />
        <p>
          <Link href="/">← Regresar al inicio</Link>
        </p>
      </article>
    </main>
  );
}
