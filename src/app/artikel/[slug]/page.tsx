"use client";

import { useParams } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { ContentLayout } from "@/components/panel/content-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import Link from "next/link";

export default function BlogDetailPage() {
  const { slug } = useParams();
  const { data, isLoading } = useSWR(`/api/blog/${slug}`, fetcher);

  if (isLoading) {
    return (
      <ContentLayout title="Blog">
        <div className="flex h-[80vh] items-center justify-center">
          <LoadingSpinner size={40} />
        </div>
      </ContentLayout>
    );
  }

  const blog = data?.blog;

  if (!blog) {
    return (
      <ContentLayout title="Blog">
        <div className="py-20 text-center">Blog tidak ditemukan</div>
      </ContentLayout>
    );
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
        <Image
          src={blog.image}
          alt={blog.title}
          width={640}
          height={360}
          className="h-auto w-full rounded-lg object-cover"
        />

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
