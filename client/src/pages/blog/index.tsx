import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Calendar, User, ArrowRight, Plus } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import type { BlogPost } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function BlogHome() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: posts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blogs"],
    queryFn: async () => {
      const response = await apiFetch("/api/blogs/arka_office");
      if (!response.ok) return [];
      return response.json();
    },
  });

  const canWrite = user?.role === "principle" || user?.role === "admin";

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{t("blog.title")}</h1>
          <p className="text-muted-foreground mt-2">
            Latest updates, insights, and news from ARKA
          </p>
        </div>
        {canWrite && (
          <Link href="/blog/editor">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("blog.createPost")}
            </Button>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                        {post.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="text-base">
                      {post.summary}
                    </CardDescription>
                  </div>
                  {post.coverUrl && (
                    <img
                      src={post.coverUrl}
                      alt={post.title}
                      className="w-32 h-32 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.authorName || "Admin"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.publishedAt!).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <Button variant="ghost" size="sm">
                        {t("blog.readMore")}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">{t("blog.noPosts")}</p>
            {canWrite && (
              <Link href="/blog/editor">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t("blog.createFirstPost")}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
