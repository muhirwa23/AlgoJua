import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { TrendingUp, Flame, Zap, Eye, Globe } from "lucide-react";
import { postsApi, type Post } from "@/lib/api";

export function Trends() {
  const [trendPosts, setTrendPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTrends();
  }, []);

  const loadTrends = async () => {
    try {
      setIsLoading(true);
      const posts = await postsApi.fetchByCategory("Trends");
      setTrendPosts(posts);
    } catch (error) {
      console.error("Error loading trends:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const trendCategories = [
    { name: "Technology", icon: "🚀", trending: "+45%" },
    { name: "Business", icon: "💼", trending: "+32%" },
    { name: "Finance", icon: "💰", trending: "+28%" },
    { name: "Sustainability", icon: "🌱", trending: "+56%" },
    { name: "Health", icon: "❤️", trending: "+41%" },
    { name: "Innovation", icon: "💡", trending: "+38%" }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead
        title="Latest Trends & Insights"
        description="Stay ahead with real-time analysis of trending topics in technology, business, finance, and innovation."
        keywords={["trends", "trending topics", "market trends", "technology trends", "business insights"]}
        section="Trends"
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="relative rounded-[2rem] overflow-hidden bg-card my-8 animate-fade-in grid-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-yellow-500/5" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
            <div className="flex flex-col justify-center space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 w-fit animate-slide-down">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-500">Updated Every 6 Hours</span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-slide-up">
                  Discover What's
                  <span className="text-gradient block mt-2">Trending Now</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
                  Real-time analysis of emerging trends, hot topics, and industry shifts that matter.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 animate-slide-up stagger-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium neon-button group w-full sm:w-auto">
                  View Trends
                  <TrendingUp className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 text-base font-medium border-border hover:bg-secondary w-full sm:w-auto">
                  Submit Trend
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 animate-slide-up stagger-3">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient">1.2M+</p>
                  <p className="text-sm text-muted-foreground">Daily Views</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-accent">24/7</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">Real-time Data</h3>
                    <p className="text-muted-foreground text-sm mt-1">Live updates on viral topics</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-red-500 transition-colors">Market Analysis</h3>
                    <p className="text-muted-foreground text-sm mt-1">Deep dives into market shifts</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-yellow-500 transition-colors">Global Scope</h3>
                    <p className="text-muted-foreground text-sm mt-1">Trends from around the world</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Trends */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Viral Now</h2>
              <p className="text-muted-foreground mt-2">The most talked-about topics today</p>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading trends...</p>
            </div>
          ) : trendPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No trends available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendPosts.map((trend, index) => (
                <div key={trend.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                  <ArticleCard 
                    id={trend.id}
                    title={trend.title}
                    subtitle={trend.subtitle}
                    category={trend.category}
                    date={new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    readTime={trend.read_time}
                    image={trend.image_url}
                    author={{
                      name: trend.author_name,
                      avatar: trend.author_avatar,
                      bio: trend.author_bio
                    }}
                    content={{
                      introduction: trend.content_introduction || "",
                      sections: trend.content_sections,
                      conclusion: trend.content_conclusion || ""
                    }}
                    tags={trend.tags}
                    size="small"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default Trends;