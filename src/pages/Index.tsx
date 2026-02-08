import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import ArticleCard from "@/components/ArticleCard";
import HeroSection from "@/components/HeroSection";
import { postsApi, type Post } from "@/lib/api";
import { ArrowRight } from "lucide-react";


const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await postsApi.fetchAll();
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
      avatar: post.author_avatar,
      bio: post.author_bio,
    },
    tags: post.tags,
  }));

  // Insert ad after every 3 items
  const renderArticlesWithAds = () => {
    const items: React.ReactNode[] = [];

    featuredArticles.forEach((article, index) => {
      items.push(
        <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
          <ArticleCard {...article} size="small" />
        </div>
      );


    });

    return items;
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection />



        {/* Featured Articles Grid */}
        <section id="articles" className="py-12">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">Latest Articles</h2>
              <p className="text-muted-foreground mt-2">Fresh insights on jobs, tools, and trends</p>
            </div>
            <a href="#all" className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group">
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-64 bg-slate-800 rounded-lg"></div>
                </div>
              ))
            ) : featuredArticles.length > 0 ? (
              renderArticlesWithAds()
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
