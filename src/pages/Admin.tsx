import type * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlusCircle, Save, Eye, Trash2, Lock, Edit2, ArrowLeft, Upload, Image as ImageIcon, FolderOpen, Tag, BarChart3, Briefcase } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { postsApi, jobsApi, authApi, uploadApi, type Post, type Job } from "@/lib/api";
import { uploadImageToR2 } from "@/lib/r2";

import { categoriesDb, type Category } from "@/lib/categories";
import { categoriesApi } from "@/lib/api-categories";
import { SEOFields } from "@/components/admin/SEOFields";
import { CategoriesManager } from "@/components/admin/CategoriesManager";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { mediaApi, type MediaItem } from "@/lib/api-media";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import "@/styles/rich-text-editor.css";

  export function Admin() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [activeTab, setActiveTab] = useState("dashboard");
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [quickCategoryName, setQuickCategoryName] = useState("");
    const [posts, setPosts] = useState<Post[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isJobsLoading, setIsJobsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set());
    
    const [formData, setFormData] = useState({

    title: "",
    subtitle: "",
    category: "Tools",
    readTime: "5 min",
    image_url: "",
    authorName: "",
    authorAvatar: "",
    authorBio: "",
    introduction: "",
    sections: [{ heading: "", content: "" }],
    conclusion: "",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogImage: "",
    slug: "",
  });

    const [categoryFormData, setCategoryFormData] = useState({
      name: "",
      slug: "",
      description: "",
      color: "#3b82f6",
      icon: "",
    });

    const [jobFormData, setJobFormData] = useState({
      title: "",
      company: "",
      location: "",
      type: "Full-time",
      category: "Engineering",
      salary: "",
      image_url: "",
      tags: "",
      applicants: "0+",
      description: "",
      responsibilities: "",
      requirements: "",
      application_url: "",
    });


    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem("admin_token");
        if (token) {
          try {
            const result = await authApi.verify();
            if (result.valid) {
              setIsAuthenticated(true);
              loadPosts();
              loadJobs();
              loadCategories();
              loadMedia();
            } else {
              localStorage.removeItem("admin_token");
              sessionStorage.removeItem("admin_authenticated");
            }
          } catch {
            localStorage.removeItem("admin_token");
            sessionStorage.removeItem("admin_authenticated");
          }
        }
      };
      checkAuth();
    }, []);


    const loadPosts = async () => {
      try {
        setIsLoading(true);
        const fetchedPosts = await postsApi.fetchAll();
        setPosts(fetchedPosts);
      } catch (error) {
        toast.error("Failed to load posts");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const loadJobs = async () => {
      try {
        setIsJobsLoading(true);
        const fetchedJobs = await jobsApi.fetchAll();
        setJobs(fetchedJobs);
      } catch (error) {
        toast.error("Failed to load jobs");
        console.error(error);
      } finally {
        setIsJobsLoading(false);
      }
    };

    const loadCategories = async () => {

    try {
      const fetchedCategories = await categoriesApi.fetchAll();
      setCategories(fetchedCategories);
    } catch (error) {
      toast.error("Failed to load categories");
      console.error(error);
    }
  };

  const loadMedia = async () => {
    try {
      console.log('🔄 Loading media from database...');
      const fetchedMedia = await mediaApi.fetchAll();
      console.log('✅ Fetched media:', fetchedMedia.length, 'items');
      console.log('📋 Media data:', fetchedMedia);
      setMedia(fetchedMedia);
    } catch (error) {
      toast.error("Failed to load media");
      console.error('❌ Error loading media:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      toast.info("Uploading image to Cloudflare R2...");
      
      const result = await uploadImageToR2(file);
      
      if (type === 'author') {
        setFormData({ ...formData, authorAvatar: result.url });
      } else if (type === 'og') {
        setFormData({ ...formData, ogImage: result.url });
      } else {
        setFormData({ ...formData, image_url: result.url });
      }
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

    const handleLogin = async () => {
      try {
        await authApi.login(password);
        setIsAuthenticated(true);
        sessionStorage.setItem("admin_authenticated", "true");
        loadPosts();
        loadJobs();
        loadCategories();
        loadMedia();
        toast.success("Welcome to the admin portal!");
      } catch (error) {
        toast.error("Invalid password");
      }
    };


  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem("admin_authenticated");
    localStorage.removeItem("admin_token");
    setPassword("");
  };

  const addSection = () => {
    setFormData({
      ...formData,
      sections: [...formData.sections, { heading: "", content: "" }],
    });
  };

  const updateSection = (index: number, field: "heading" | "content", value: string) => {
    const newSections = [...formData.sections];
    newSections[index][field] = value;
    setFormData({ ...formData, sections: newSections });
  };

  const removeSection = (index: number) => {
    setFormData({
      ...formData,
      sections: formData.sections.filter((_, i) => i !== index),
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      category: "Tools",
      readTime: "5 min",
      image_url: "",
      authorName: "",
      authorAvatar: "",
      authorBio: "",
      introduction: "",
      sections: [{ heading: "", content: "" }],
      conclusion: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      ogImage: "",
      slug: "",
    });
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.subtitle || !formData.introduction) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const slug = formData.slug || formData.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const postData = {
        title: formData.title,
        subtitle: formData.subtitle,
        category: formData.category,
        image_url: formData.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&q=80",
        author_name: formData.authorName,
        author_bio: formData.authorBio,
        author_avatar: formData.authorAvatar,
        content_introduction: formData.introduction,
        content_sections: formData.sections.filter(s => s.heading && s.content),
        content_conclusion: formData.conclusion,
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        read_time: formData.readTime,
        meta_title: formData.metaTitle || formData.title,
        meta_description: formData.metaDescription || formData.subtitle,
        meta_keywords: formData.metaKeywords.split(",").map(t => t.trim()).filter(Boolean),
        og_image: formData.ogImage || formData.image_url,
        slug: slug,
      };

      if (editingId) {
        await postsApi.update(editingId, postData);
        toast.success("Post updated successfully!");
      } else {
        await postsApi.create(postData);
        toast.success("Post created successfully!");
      }

      await loadPosts();
      resetForm();
    } catch (error) {
      toast.error(editingId ? "Failed to update post" : "Failed to create post");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post: Post) => {
    setFormData({
      title: post.title,
      subtitle: post.subtitle || "",
      category: post.category,
      readTime: post.read_time,
      image_url: post.image_url,
      authorName: post.author_name,
      authorAvatar: post.author_avatar,
      authorBio: post.author_bio,
      introduction: post.content_introduction || "",
      sections: post.content_sections.length > 0 ? post.content_sections : [{ heading: "", content: "" }],
      conclusion: post.content_conclusion || "",
      tags: post.tags.join(", "),
      metaTitle: post.meta_title || "",
      metaDescription: post.meta_description || "",
      metaKeywords: post.meta_keywords?.join(", ") || "",
      ogImage: post.og_image || "",
      slug: post.slug || "",
    });
    setEditingId(post.id);
    toast.info("Editing post");
  };

    const handleDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this post?")) {
        setIsLoading(true);
        try {
          await postsApi.delete(id);
          await loadPosts();
          toast.success("Post deleted");
        } catch (error) {
          toast.error("Failed to delete post");
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const resetJobForm = () => {
      setJobFormData({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        category: "Engineering",
        salary: "",
        image_url: "",
        tags: "",
        applicants: "0+",
        description: "",
        responsibilities: "",
        requirements: "",
        application_url: "",
      });
      setEditingJobId(null);
    };

    const handleJobSave = async () => {
      const responsibilities = jobFormData.responsibilities
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const requirements = jobFormData.requirements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const tags = jobFormData.tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      if (
        !jobFormData.title ||
        !jobFormData.company ||
        !jobFormData.location ||
        !jobFormData.type ||
        !jobFormData.category ||
        !jobFormData.salary ||
        !jobFormData.image_url ||
        !jobFormData.description ||
        !jobFormData.application_url ||
        responsibilities.length === 0 ||
        requirements.length === 0
      ) {
        toast.error("Please fill in all required job fields");
        return;
      }

      setIsJobsLoading(true);
      try {
        const jobPayload = {
          title: jobFormData.title,
          company: jobFormData.company,
          location: jobFormData.location,
          type: jobFormData.type,
          category: jobFormData.category,
          salary: jobFormData.salary,
          image_url: jobFormData.image_url,
          tags,
          applicants: jobFormData.applicants || "0+",
          description: jobFormData.description,
          responsibilities,
          requirements,
          application_url: jobFormData.application_url,
        };

        if (editingJobId) {
          await jobsApi.update(editingJobId, jobPayload);
          toast.success("Job updated successfully!");
        } else {
          await jobsApi.create(jobPayload);
          toast.success("Job created successfully!");
        }

        await loadJobs();
        resetJobForm();
      } catch (error) {
        toast.error(editingJobId ? "Failed to update job" : "Failed to create job");
        console.error(error);
      } finally {
        setIsJobsLoading(false);
      }
    };

    const handleJobEdit = (job: Job) => {
      setJobFormData({
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        category: job.category,
        salary: job.salary,
        image_url: job.image_url,
        tags: job.tags.join(", "),
        applicants: job.applicants,
        description: job.description,
        responsibilities: job.responsibilities.join("\n"),
        requirements: job.requirements.join("\n"),
        application_url: job.application_url,
      });
      setEditingJobId(job.id);
      toast.info("Editing job");
    };

    const handleJobDelete = async (id: string) => {
      if (confirm("Are you sure you want to delete this job?")) {
        setIsJobsLoading(true);
        try {
          await jobsApi.delete(id);
          await loadJobs();
          toast.success("Job deleted");
        } catch (error) {
          toast.error("Failed to delete job");
          console.error(error);
        } finally {
          setIsJobsLoading(false);
        }
      }
    };

    const handleCategorySave = async (category: { name: string; slug: string; description: string; color: string; icon: string }) => {

    try {
      await categoriesApi.create(category);
      await loadCategories();
    } catch (error) {
      throw error;
    }
  };

  const handleCategoryUpdate = async (id: string, category: Partial<{ name: string; slug: string; description: string; color: string; icon: string }>) => {
    try {
      await categoriesApi.update(id, category);
      await loadCategories();
    } catch (error) {
      throw error;
    }
  };

    const handleCategoryDelete = async (id: string) => {
      try {
        await categoriesApi.delete(id);
        await loadCategories();
      } catch (error) {
        throw error;
      }
    };

    const handleQuickAddCategory = async () => {
      if (!quickCategoryName.trim()) {
        toast.error("Category name is required");
        return;
      }

      try {
        const slug = quickCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        await categoriesApi.create({
          name: quickCategoryName,
          slug,
          description: `Posts about ${quickCategoryName}`,
          color: "#3b82f6",
          icon: "📁"
        });
        await loadCategories();
        setFormData({ ...formData, category: quickCategoryName });
        setQuickCategoryName("");
        setIsAddCategoryOpen(false);
        toast.success(`Category "${quickCategoryName}" added and selected`);
      } catch (error) {
        toast.error("Failed to add category");
        console.error(error);
      }
    };

    const handleMediaUpload = async (file: File, metadata?: { alt_text?: string; caption?: string }) => {
    try {
      await mediaApi.upload(file, metadata);
      await loadMedia();
    } catch (error) {
      throw error;
    }
  };

  const handleMediaUpdate = async (id: string, updates: { alt_text?: string; caption?: string }) => {
    try {
      await mediaApi.update(id, updates);
      await loadMedia();
    } catch (error) {
      throw error;
    }
  };

  const handleMediaDelete = async (id: string) => {
    try {
      await mediaApi.delete(id);
      await loadMedia();
    } catch (error) {
      throw error;
    }
  };

  const handleMediaSearch = async (query: string) => {
    try {
      const searchResults = await mediaApi.search(query);
      setMedia(searchResults);
    } catch (error) {
      toast.error("Failed to search media");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl border-slate-800">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">Admin Portal</CardTitle>
            <CardDescription>Enter your password to access the content management system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                className="bg-slate-900 border-slate-700"
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Lock className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-primary">Algo</span><span>jua</span> Admin
            </h1>
            <p className="text-sm text-slate-400 mt-1">Content Management System</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button onClick={handleLogout} variant="destructive" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-900 border border-slate-800">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-primary">
                <PlusCircle className="w-4 h-4 mr-2" />
                {editingId ? "Edit Post" : "Create Post"}
              </TabsTrigger>
              <TabsTrigger value="manage" className="data-[state=active]:bg-primary">
                <Edit2 className="w-4 h-4 mr-2" />
                Manage Posts ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-primary">
                <Briefcase className="w-4 h-4 mr-2" />
                Jobs ({jobs.length})
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-primary">
                <Tag className="w-4 h-4 mr-2" />
                Categories ({categories.length})
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-primary">
                <FolderOpen className="w-4 h-4 mr-2" />
                Media Library ({media.length})
              </TabsTrigger>
            </TabsList>


          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Total Posts</span>
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-3xl font-bold">{posts.length}</p>
                  <p className="text-sm text-slate-400 mt-2">Published articles</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Categories</span>
                    <Tag className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-3xl font-bold">{categories.length}</p>
                  <p className="text-sm text-slate-400 mt-2">Active categories</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-400">Media Files</span>
                    <FolderOpen className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-3xl font-bold">{media.length}</p>
                  <p className="text-sm text-slate-400 mt-2">Images in library</p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>Recent Posts</CardTitle>
                <CardDescription>Your latest published articles</CardDescription>
              </CardHeader>
              <CardContent>
                {posts.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No posts yet. Create your first one!</p>
                ) : (
                  <div className="space-y-3">
                    {posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-950 border border-slate-800">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{post.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                            <span className="text-xs text-slate-500">{new Date(post.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button onClick={() => handleEdit(post)} variant="outline" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Posts by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categories.map((cat) => {
                      const count = posts.filter(p => p.category === cat.name).length;
                      return (
                        <div key={cat.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span className="text-sm">{cat.name}</span>
                          </div>
                          <Badge variant="outline">{count} posts</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Frequently used tools</CardDescription>
                </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("create")}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create New Post
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("media")}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("categories")}>
                      <Tag className="w-4 h-4 mr-2" />
                      Manage Categories
                    </Button>
                  </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>{editingId ? "Edit Post" : "Create New Post"}</CardTitle>
                <CardDescription>Fill in the details below to {editingId ? "update" : "publish"} your post</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter post title"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="category">Category</Label>
                        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <PlusCircle className="w-3 h-3 mr-1" />
                              Quick Add
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Add New Category</DialogTitle>
                              <DialogDescription className="text-slate-400">
                                Create a new category quickly. You can edit full details in the Categories tab.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="new-category-name">Category Name</Label>
                                <Input
                                  id="new-category-name"
                                  value={quickCategoryName}
                                  onChange={(e) => setQuickCategoryName(e.target.value)}
                                  placeholder="e.g. AI Trends"
                                  className="bg-slate-950 border-slate-700"
                                  autoFocus
                                  onKeyPress={(e) => e.key === "Enter" && handleQuickAddCategory()}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddCategoryOpen(false)} className="border-slate-700">
                                Cancel
                              </Button>
                              <Button onClick={handleQuickAddCategory}>
                                Add Category
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name} className="hover:bg-slate-800 focus:bg-slate-800">
                              <span className="flex items-center gap-2">
                                <span className="text-lg">{cat.icon}</span>
                                <span>{cat.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtitle *</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Brief description"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input
                      id="readTime"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      placeholder="5 min"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Featured Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="bg-slate-900 border-slate-700 flex-1"
                      />
                      {isUploading && (
                        <div className="flex items-center px-3 text-sm text-muted-foreground">
                          <Upload className="w-4 h-4 animate-pulse" />
                        </div>
                      )}
                    </div>
                    {formData.image_url && (
                      <div className="mt-2 relative group">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-32 object-cover rounded-lg border border-slate-700"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">Or paste image URL directly</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="authorName">Author Name</Label>
                    <Input
                      id="authorName"
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      placeholder="John Doe"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="authorBio">Author Bio</Label>
                    <Input
                      id="authorBio"
                      value={formData.authorBio}
                      onChange={(e) => setFormData({ ...formData, authorBio: e.target.value })}
                      placeholder="Writer & Creator"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>
                    <div className="space-y-2">
                      <Label htmlFor="authorAvatar">Author Avatar URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="authorAvatar"
                          value={formData.authorAvatar}
                          onChange={(e) => setFormData({ ...formData, authorAvatar: e.target.value })}
                          placeholder="https://..."
                          className="bg-slate-900 border-slate-700 flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => document.getElementById('author-avatar-upload')?.click()}
                          disabled={isUploading}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                        <input
                          id="author-avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'author')}
                        />
                      </div>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="introduction">Introduction *</Label>
                  <RichTextEditor
                    value={formData.introduction}
                    onChange={(value) => setFormData({ ...formData, introduction: value })}
                    placeholder="Write your introduction here..."
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Content Sections</Label>
                    <Button onClick={addSection} variant="outline" size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Add Section
                    </Button>
                  </div>
                  
                  {formData.sections.map((section, index) => (
                    <Card key={index} className="bg-slate-950 border-slate-800">
                      <CardContent className="pt-6 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Section {index + 1}</Label>
                          <Button
                            onClick={() => removeSection(index)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          value={section.heading}
                          onChange={(e) => updateSection(index, "heading", e.target.value)}
                          placeholder="Section heading"
                          className="bg-slate-900 border-slate-700"
                        />
                        <RichTextEditor
                          value={section.content}
                          onChange={(value) => updateSection(index, "content", value)}
                          placeholder="Write your section content here..."
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion">Conclusion</Label>
                  <RichTextEditor
                    value={formData.conclusion}
                    onChange={(value) => setFormData({ ...formData, conclusion: value })}
                    placeholder="Write your conclusion here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="AI, developer tools, productivity"
                    className="bg-slate-900 border-slate-700"
                  />
                </div>

                  <SEOFields
                    formData={{
                      metaTitle: formData.metaTitle,
                      metaDescription: formData.metaDescription,
                      metaKeywords: formData.metaKeywords,
                      ogImage: formData.ogImage,
                      slug: formData.slug,
                    }}
                    onChange={(field, value) => setFormData({ ...formData, [field]: value })}
                    onUpload={handleImageUpload}
                    isUploading={isUploading}
                  />

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSave} className="flex-1" size="lg" disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : editingId ? "Update Post" : "Publish Post"}
                  </Button>
                  {editingId && (
                    <Button onClick={resetForm} variant="outline" size="lg">
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-4">
            {isLoading ? (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400">Loading posts...</p>
                </CardContent>
              </Card>
            ) : posts.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-400">No posts yet. Create your first one!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post) => (
                <Card key={post.id} className="border-slate-800 bg-slate-900/50 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{post.category}</Badge>
                          <span className="text-sm text-slate-400">{new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="text-sm text-slate-400">• {post.read_time}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1 truncate">{post.title}</h3>
                        <p className="text-slate-400 text-sm mb-3 line-clamp-2">{post.subtitle}</p>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button onClick={() => handleEdit(post)} variant="outline" size="sm" disabled={isLoading}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button onClick={() => handleDelete(post.id)} variant="destructive" size="sm" disabled={isLoading}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            </TabsContent>

            <TabsContent value="jobs" className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>{editingJobId ? "Edit Job" : "Create New Job"}</CardTitle>
                  <CardDescription>
                    Fill in the details below to {editingJobId ? "update" : "publish"} a job listing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-title">Job Title *</Label>
                      <Input
                        id="job-title"
                        value={jobFormData.title}
                        onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
                        placeholder="Senior Software Engineer"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-company">Company *</Label>
                      <Input
                        id="job-company"
                        value={jobFormData.company}
                        onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                        placeholder="Acme Inc."
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-location">Location *</Label>
                      <Input
                        id="job-location"
                        value={jobFormData.location}
                        onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                        placeholder="Remote / Nairobi"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Type *</Label>
                      <Select
                        value={jobFormData.type}
                        onValueChange={(value) => setJobFormData({ ...jobFormData, type: value })}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Category *</Label>
                      <Select
                        value={jobFormData.category}
                        onValueChange={(value) => setJobFormData({ ...jobFormData, category: value })}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-salary">Salary *</Label>
                      <Input
                        id="job-salary"
                        value={jobFormData.salary}
                        onChange={(e) => setJobFormData({ ...jobFormData, salary: e.target.value })}
                        placeholder="$120k–$160k"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-applicants">Applicants</Label>
                      <Input
                        id="job-applicants"
                        value={jobFormData.applicants}
                        onChange={(e) => setJobFormData({ ...jobFormData, applicants: e.target.value })}
                        placeholder="0+"
                        className="bg-slate-900 border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-image">Company Image URL *</Label>
                    <Input
                      id="job-image"
                      value={jobFormData.image_url}
                      onChange={(e) => setJobFormData({ ...jobFormData, image_url: e.target.value })}
                      placeholder="https://..."
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-application-url">Application URL *</Label>
                    <Input
                      id="job-application-url"
                      value={jobFormData.application_url}
                      onChange={(e) => setJobFormData({ ...jobFormData, application_url: e.target.value })}
                      placeholder="https://company.com/careers/apply"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-description">Description *</Label>
                    <Textarea
                      id="job-description"
                      value={jobFormData.description}
                      onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
                      placeholder="Short summary about the role..."
                      className="bg-slate-900 border-slate-700 min-h-[110px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-responsibilities">Responsibilities * (one per line)</Label>
                      <Textarea
                        id="job-responsibilities"
                        value={jobFormData.responsibilities}
                        onChange={(e) => setJobFormData({ ...jobFormData, responsibilities: e.target.value })}
                        placeholder="Design and build features\nReview PRs\nCollaborate with product"
                        className="bg-slate-900 border-slate-700 min-h-[140px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="job-requirements">Requirements * (one per line)</Label>
                      <Textarea
                        id="job-requirements"
                        value={jobFormData.requirements}
                        onChange={(e) => setJobFormData({ ...jobFormData, requirements: e.target.value })}
                        placeholder="3+ years experience\nReact / TypeScript\nGood communication"
                        className="bg-slate-900 border-slate-700 min-h-[140px]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-tags">Tags (comma-separated)</Label>
                    <Input
                      id="job-tags"
                      value={jobFormData.tags}
                      onChange={(e) => setJobFormData({ ...jobFormData, tags: e.target.value })}
                      placeholder="React, Remote, Senior"
                      className="bg-slate-900 border-slate-700"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleJobSave} className="flex-1" size="lg" disabled={isJobsLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isJobsLoading ? "Saving..." : editingJobId ? "Update Job" : "Publish Job"}
                    </Button>
                    {editingJobId && (
                      <Button onClick={resetJobForm} variant="outline" size="lg">
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-800 bg-slate-900/50">
                <CardHeader>
                  <CardTitle>Manage Jobs ({jobs.length})</CardTitle>
                  <CardDescription>Edit or delete existing job listings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isJobsLoading ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-400">Loading jobs...</p>
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="py-12 text-center">
                      <p className="text-slate-400">No jobs yet. Create your first one!</p>
                    </div>
                  ) : (
                    jobs.map((job) => (
                      <Card
                        key={job.id}
                        className="border-slate-800 bg-slate-950 hover:border-primary/50 transition-colors"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="secondary">{job.category}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  {job.type}
                                </Badge>
                                <span className="text-sm text-slate-400">{job.location}</span>
                                <span className="text-sm text-slate-500">•</span>
                                <span className="text-sm text-slate-400">
                                  {new Date(job.date_posted).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              <h3 className="text-xl font-bold mb-1 truncate">{job.title}</h3>
                              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                {job.company} • {job.salary}
                              </p>
                              {job.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {job.tags.slice(0, 6).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Button
                                onClick={() => handleJobEdit(job)}
                                variant="outline"
                                size="sm"
                                disabled={isJobsLoading}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleJobDelete(job.id)}
                                variant="destructive"
                                size="sm"
                                disabled={isJobsLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">

            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>Categories Management</CardTitle>
                <CardDescription>Create and manage blog post categories</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoriesManager
                  categories={categories}
                  onSave={handleCategorySave}
                  onUpdate={handleCategoryUpdate}
                  onDelete={handleCategoryDelete}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <Card className="border-slate-800 bg-slate-900/50">
              <CardHeader>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>Manage images stored in Cloudflare R2</CardDescription>
              </CardHeader>
              <CardContent>
                <MediaLibrary
                  media={media}
                  onUpload={handleMediaUpload}
                  onUpdate={handleMediaUpdate}
                  onDelete={handleMediaDelete}
                  onSearch={handleMediaSearch}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default Admin;