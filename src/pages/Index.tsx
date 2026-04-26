import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import HeroSection from "@/components/HeroSection";
import { postsApi, type Post } from "@/lib/api";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [totalArticles, setTotalArticles] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await postsApi.fetchAll();
        setTotalArticles(fetchedPosts.length);
        setPosts(fetchedPosts.slice(0, 6));
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const featuredArticles = posts.map(post => ({
    id: post.id,
    title: post.title,
    subtitle: post.subtitle || '',
    category: post.category,
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: post.read_time,
    image: post.image_url,
    slug: post.slug,
    author: {
      name: post.author_name,
      avatar: "",
      bio: "",
    },
    tags: post.tags,
  }));

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection articleCount={totalArticles} />

        {/* Featured Articles Grid */}
        <section id="articles" className="py-12">
          {/* Topics and Search Filter */}
          <div className="mb-8 animate-slide-up flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <button className="font-semibold text-lg flex items-center gap-1.5 focus:outline-none">
                Topics <span className="text-[10px]">^</span>
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {['Company', 'Developers', 'Enterprise', 'Research', 'Security', 'Updates'].map(topic => (
                <button key={topic} className="px-4 py-1.5 bg-secondary/60 text-secondary-foreground text-sm font-medium hover:bg-secondary/80 rounded-full transition-colors">
                  {topic}
                </button>
              ))}
            </div>
            <div className="w-full max-w-xl mt-2">
              <input 
                type="text" 
                placeholder="Search articles" 
                className="w-full px-4 py-2 bg-transparent border border-input/50 rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-64 bg-slate-800 rounded-lg"></div>
                  </div>
                ))
              ) : featuredArticles.length > 0 ? (
                featuredArticles.map((article, index) => (
                  <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                    <ArticleCard {...article} size="small" />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No posts yet. Check back soon!</p>
                </div>
              )}
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
