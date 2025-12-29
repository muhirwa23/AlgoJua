import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, ArrowRight, Code, Image as ImageIcon, FileText, Globe } from "lucide-react";

export function AITools() {
  const toolCategories = [
    { name: "Chatbots", icon: "💬", count: 47 },
    { name: "Coding", icon: "💻", count: 32 },
    { name: "Image Gen", icon: "🎨", count: 56 },
    { name: "Writing", icon: "✍️", count: 28 },
    { name: "Video", icon: "🎥", count: 64 },
    { name: "Audio", icon: "🎵", count: 19 }
  ];

  const featuredTools = [
    {
      id: "tool-1",
      name: "ChatGPT Plus",
      category: "Chatbot",
      pricing: "Paid",
      description: "Advanced conversational AI powered by GPT-4. Perfect for writing, coding, and creative tasks.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=60",
      tags: ["Conversation", "Code", "Writing"],
      rating: 4.8
    },
    {
      id: "tool-2",
      name: "Midjourney",
      category: "Image Gen",
      pricing: "Paid",
      description: "Create stunning AI-generated artwork with simple text prompts. Industry-leading image quality.",
      image: "https://images.unsplash.com/photo-1686191128892-c2f85a4e6f5e?w=800&auto=format&fit=crop&q=60",
      tags: ["Art", "Design", "Creative"],
      rating: 4.9
    },
    {
      id: "tool-3",
      name: "GitHub Copilot",
      category: "Coding",
      pricing: "Paid",
      description: "Your AI pair programmer. Get code suggestions as you type and accelerate your development.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
      tags: ["Code", "AI Assistant", "Development"],
      rating: 4.7
    },
    {
      id: "tool-4",
      name: "Runway ML",
      category: "Video",
      pricing: "Freemium",
      description: "AI-powered video editing and generation. Create, edit, and enhance videos with artificial intelligence.",
      image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=60",
      tags: ["Video", "Editing", "Generation"],
      rating: 4.6
    },
    {
      id: "tool-5",
      name: "Jasper AI",
      category: "Writing",
      pricing: "Paid",
      description: "AI content platform for marketing teams. Generate blog posts, ads, emails, and more.",
      image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=60",
      tags: ["Content", "Marketing", "Copywriting"],
      rating: 4.5
    },
    {
      id: "tool-6",
      name: "ElevenLabs",
      category: "Audio",
      pricing: "Freemium",
      description: "Realistic AI voice synthesis. Clone voices, generate speech, and create audio content.",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=60",
      tags: ["Voice", "TTS", "Audio"],
      rating: 4.8
    }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead
        title="AI Tools & Software"
        description="Discover the best AI tools and software for your business. From chatbots to image generation, find the perfect AI solution."
        keywords={["ai tools", "artificial intelligence", "chatbots", "ai software", "machine learning tools"]}
        section="AI Tools"
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden bg-card my-8 animate-fade-in grid-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-transparent" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
            <div className="flex flex-col justify-center space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 w-fit animate-slide-down">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-indigo-500">246 AI Tools</span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-slide-up">
                  Discover the Best
                  <span className="text-gradient block mt-2">AI Tools</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
                  Curated collection of AI-powered tools to supercharge your workflow. From chatbots to image generation.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 animate-slide-up stagger-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium neon-button group w-full sm:w-auto">
                  Browse Tools
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 text-base font-medium border-border hover:bg-secondary w-full sm:w-auto">
                  Submit Tool
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 animate-slide-up stagger-3">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient">246+</p>
                  <p className="text-sm text-muted-foreground">AI Tools</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-accent">12</p>
                  <p className="text-sm text-muted-foreground">Categories</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
               <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                    <Code className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-indigo-500 transition-colors">Coding Tools</h3>
                    <p className="text-muted-foreground text-sm mt-1">AI-powered code generation and assistance</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-pink-600 dark:text-pink-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-pink-500 transition-colors">Image Generation</h3>
                    <p className="text-muted-foreground text-sm mt-1">Create stunning visuals with AI</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-cyan-500 transition-colors">Content Writing</h3>
                    <p className="text-muted-foreground text-sm mt-1">Generate high-quality written content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Tools */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trending Tools</h2>
              <p className="text-muted-foreground mt-2">Most popular AI solutions this week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.map((tool, index) => (
              <div key={tool.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <ArticleCard 
                  id={tool.id}
                  title={tool.name}
                  category={tool.category}
                  date={tool.pricing}
                  metric={`${tool.rating}★`}
                  summary={`${tool.pricing} • ${tool.description}`}
                  image={tool.image}
                  size="small"
                  type="tools"
                />
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}

export default AITools;