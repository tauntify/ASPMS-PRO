import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Calendar, User, ArrowLeft, Eye, Heart } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { BlogPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function BlogPostView() {
  const { t } = useTranslation();
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: [`/api/blogs/${slug}`],
    queryFn: async () => {
      const response = await apiFetch(`/api/blogs/arka_office/${slug}`);
      if (!response.ok) {
        throw new Error("Post not found");
      }
      return response.json();
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2 mb-8" />
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Post not found</p>
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t("blog.backToBlog")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("blog.backToBlog")}
        </Button>
      </Link>

      <article>
        {post.coverUrl && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.coverUrl}
              alt={post.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-muted-foreground mb-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{post.authorName || "Admin"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(post.publishedAt!).toLocaleDateString()}</span>
            </div>
            {post.views && (
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{post.views} views</span>
              </div>
            )}
            {post.likes && (
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{post.likes} likes</span>
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <Separator className="mb-8" />

        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <p className="text-xl text-muted-foreground mb-6">{post.summary}</p>
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </div>

        <Separator className="my-8" />

        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Comments</h3>
          <p className="text-sm text-muted-foreground">
            Comment functionality will be implemented in a future update.
            Users will be able to read and comment, while admins can reply.
          </p>
        </div>
      </article>
    </div>
  );
}
