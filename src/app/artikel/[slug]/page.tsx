import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { ContentLayout } from "@/components/panel/content-layout";
import { getArticleBySlug } from "@/lib/data/articles";

interface BlogDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getArticleBySlug(slug);

  if (!blog) {
    return { title: "Feryshop | Artikel Tidak Ditemukan" };
  }

  const description = blog.excerpt ?? `Artikel ${blog.title} di Feryshop.`;

  return {
    title: `Feryshop | ${blog.title}`,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: "article",
      url: `https://feryshop.com/artikel/${slug}`,
      images: blog.thumbnail
        ? [{ url: blog.thumbnail, width: 640, height: 360, alt: blog.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: blog.thumbnail ? [blog.thumbnail] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getArticleBySlug(slug);

  if (!blog) {
    notFound();
  }

  return (
    <ContentLayout title={blog.title}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="text-muted-foreground text-sm">
          <Link href="/artikel" className="hover:underline">
            Artikel
          </Link>{" "}
          / {blog.title}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold tracking-tight">{blog.title}</h1>

        {/* Featured Image */}
        {blog.image ? (
          <Image
            src={blog.image}
            alt={blog.title}
            width={640}
            height={360}
            className="h-auto w-full rounded-lg object-cover"
          />
        ) : null}

        {/* Meta Info */}
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>{format(new Date(blog.published_at), "dd MMM yyyy")}</span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            {blog.views}
          </span>
        </div>

        {/* Content */}
        <article
          className="prose dark:prose-invert max-w-none break-words"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      </div>
    </ContentLayout>
  );
}
