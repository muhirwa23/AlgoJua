import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { postsApi, type Post } from "@/lib/api";

const Growth = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await postsApi.fetchByCategory("Growth");
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to load growth posts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const growthArticles = posts.map(post => ({
    id: post.id,
    title: post.title,
    subtitle: post.subtitle || '',
    category: post.category,
    date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: post.read_time,
    image: post.image_url,
    author: {
      name: post.author_name,
      avatar: post.author_avatar,
      bio: post.author_bio,
    },
    tags: post.tags,
  }));

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Personal Growth
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            Embark on a journey of self-discovery and continuous improvement. 
            Explore insights, practices, and perspectives that support your evolution into your best self.
          </p>
        </div>

          {/* Articles Grid */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="h-64 bg-slate-800 rounded-lg"></div>
                  </div>
                ))
              ) : growthArticles.length > 0 ? (
                growthArticles.map((article, index) => (
                  <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 2, 6)}`}>
                    <ArticleCard {...article} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No growth articles yet.</p>
                </div>
              )}
            </div>
          </section>

        {/* Growth Philosophy */}
        <section className="mt-16 rounded-2xl bg-card p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Path of Growth</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Personal growth isn't about perfection—it's about progress, self-awareness, and the courage to evolve. 
                It's the daily practice of becoming more aligned with our values, more compassionate toward ourselves 
                and others, and more intentional in how we live.
              </p>
              <p>
                Through thoughtful reflection, practical strategies, and inspiring stories, we explore what it means 
                to grow as individuals. From building resilience to letting go of what no longer serves us, 
                every step on this journey matters. Join us as we navigate the beautiful, challenging work of 
                becoming who we're meant to be.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Growth;
