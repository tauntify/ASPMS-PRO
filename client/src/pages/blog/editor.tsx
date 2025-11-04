import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Save, Eye } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  summary: z.string().min(1, "Summary is required"),
  contentMarkdown: z.string().min(1, "Content is required"),
  coverUrl: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  published: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

export default function BlogEditor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [preview, setPreview] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      summary: "",
      contentMarkdown: "",
      coverUrl: "",
      tags: "",
      published: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        orgId: user?.organizationId || "arka_office",
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        contentHtml: `<p>${data.contentMarkdown.replace(/\n/g, "</p><p>")}</p>`,
        contentMarkdown: data.contentMarkdown,
        authorId: user?.id || "",
        coverUrl: data.coverUrl || undefined,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
        status: data.published ? ("published" as const) : ("draft" as const),
        published: data.published,
      };

      const response = await apiFetch("/api/blogs/arka_office", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blogs"] });
      toast({
        title: t("success.created"),
        description: "Blog post created successfully",
      });
      setLocation("/blog");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
    form.setValue("slug", slug);
  };

  if (user?.role !== "principle" && user?.role !== "admin") {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              You don't have permission to create blog posts
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("blog.createPost")}</h1>
          <p className="text-muted-foreground mt-1">Write and publish a new blog post</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {preview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {preview ? (
        <Card>
          <CardHeader>
            <CardTitle>{form.watch("title") || "Untitled"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {form.watch("summary") || "No summary"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              {form.watch("contentMarkdown").split("\n").map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postTitle")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter post title..."
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postSlug")}</FormLabel>
                      <FormControl>
                        <Input placeholder="post-url-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        URL-friendly version of the title (auto-generated)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postSummary")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of the post..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentMarkdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postContent")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your post content here..."
                          className="min-h-[400px] font-mono"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Write in plain text. Rich text editor will be added later.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postCover")}</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com/image.jpg"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a URL for the cover image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("blog.postTags")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="design, architecture, ofivio"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Comma-separated tags
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Publish immediately</FormLabel>
                        <FormDescription>
                          Make this post visible to everyone
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/blog")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {form.watch("published") ? "Publish" : "Save Draft"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
}
