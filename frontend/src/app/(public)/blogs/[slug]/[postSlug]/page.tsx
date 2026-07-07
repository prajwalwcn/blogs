import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string; postSlug: string }>;
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  redirect(`/blogs/${resolvedParams.slug}`);
}
