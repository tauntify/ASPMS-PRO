import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Edit, Trash2, Eye, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  tags: string[];
  status: "draft" | "published";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export default function BlogAdmin() {
  const { toast } = useToast();
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    status: "draft" as "draft" | "published",
  });

  // Mock data - will be replaced with real API
  const posts: BlogPost[] = [
    {
      id: "1",
      title: "Welcome to Ofivio Blog",
      slug: "welcome-to-ofivio",
      content: "<p>This is the first blog post on Ofivio platform.</p>",
      excerpt: "Introduction to Ofivio platform",
      author: "Admin",
      tags: ["announcement", "welcome"],
      status: "published",
      publishedAt: new Date(2025, 0, 15),
      createdAt: new Date(2025, 0, 15),
      updatedAt: new Date(2025, 0, 15),
    },
    {
      id: "2",
      title: "How to Manage Projects",
      slug: "how-to-manage-projects",
      content: "<p>A comprehensive guide to project management.</p>",
      excerpt: "Learn the basics of project management",
      author: "Admin",
      tags: ["tutorial", "projects"],
      status: "published",
      publishedAt: new Date(2025, 0, 20),
      createdAt: new Date(2025, 0, 20),
      updatedAt: new Date(2025, 0, 20),
    },
    {
      id: "3",
      title: "Draft: Upcoming Features",
      slug: "upcoming-features",
      content: "<p>Here are the features we're working on...</p>",
      excerpt: "Preview of upcoming features",
      author: "Admin",
      tags: ["announcement", "features"],
      status: "draft",
      createdAt: new Date(2025, 0, 22),
      updatedAt: new Date(2025, 0, 22),
    },
  ];

  const handleOpenEditor = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        tags: post.tags.join(", "),
        status: post.status,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        excerpt: "",
        tags: "",
        status: "draft",
      });
    }
    setShowEditor(true);
  };

  const handleSavePost = () => {
    // Placeholder for save logic
    toast({
      title: editingPost ? "Post updated" : "Post created",
      description: "Your blog post has been saved successfully.",
    });
    setShowEditor(false);
  };

  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      toast({
        title: "Post deleted",
        description: "The blog post has been removed.",
      });
    }
  };

  const handlePublishPost = (id: string) => {
    toast({
      title: "Post published",
      description: "The blog post is now live.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
            <p className="text-sm text-gray-500 mt-1">Create and manage blog posts</p>
          </div>
          <Button onClick={() => handleOpenEditor()} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            New Post
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-5 bg-gradient-to-br from-white to-blue-50/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{posts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-white to-green-50/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Published</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {posts.filter((p) => p.status === "published").length}
                </p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-white to-amber-50/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Drafts</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {posts.filter((p) => p.status === "draft").length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-amber-600" />
            </div>
          </Card>
          <Card className="p-5 bg-gradient-to-br from-white to-purple-50/30">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {posts.filter((p) => new Date(p.createdAt).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Posts List */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">All Posts</h3>
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-base">{post.title}</h4>
                    <Badge variant={post.status === "published" ? "default" : "secondary"}>
                      {post.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{post.excerpt}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{format(new Date(post.createdAt), "MMM d, yyyy")}</span>
                    <span>•</span>
                    <span>{post.tags.join(", ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.status === "draft" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePublishPost(post.id)}
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Publish
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenEditor(post)}
                    className="gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePost(post.id)}
                    className="gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Editor Dialog */}
        <Dialog open={showEditor} onOpenChange={setShowEditor}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Post" : "New Blog Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Input
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Short description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your post content (HTML allowed)"
                  rows={12}
                  className="font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tutorial, announcement"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v: any) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePost}>
                  {editingPost ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
