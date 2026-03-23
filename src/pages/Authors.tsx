import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { Mail, Instagram, Twitter } from "lucide-react";
import { postsApi, type Post } from "@/lib/api";

const Authors = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const fetchedPosts = await postsApi.fetchAll();
        setPosts(fetchedPosts);
      } catch (error) {
        console.error('Failed to load posts for authors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPosts();
  }, []);

  const authors = useMemo(() => {
    const authorMap = new Map();
    
    posts.forEach(post => {
      const name = post.author_name;
      if (!name) return;
      
      if (!authorMap.has(name)) {
        authorMap.set(name, {
          name,
          role: "Contributor",
          bio: "A regular contributor to Perspective, sharing insights and stories.",
          image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&q=80",
          articles: 0,
        });
      }
      authorMap.get(name).articles += 1;
    });
    
    return Array.from(authorMap.values()).sort((a, b) => b.articles - a.articles);
  }, [posts]);

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-slide-down">
            Meet Our Authors
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-slide-up stagger-1">
            The voices behind Perspective—experienced writers, practitioners, and thoughtful explorers 
            who bring diverse perspectives and genuine insights to every article.
          </p>
        </div>

        {/* Authors Grid */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-2xl bg-card p-8 animate-pulse">
                <div className="flex items-start gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-slate-800" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-slate-800 rounded w-1/2" />
                    <div className="h-4 bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-full" />
                  <div className="h-4 bg-slate-800 rounded w-5/6" />
                </div>
              </div>
            ))
          ) : authors.length > 0 ? (
            authors.map((author, index) => (
              <div key={author.name} className={`rounded-2xl bg-card p-8 hover:shadow-xl transition-all duration-300 animate-slide-up stagger-${Math.min(index + 2, 6)}`}>
                <div className="flex items-start gap-6 mb-6">
                  <img
                    src={author.image}
                    alt={author.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{author.name}</h3>
                    <p className="text-accent font-medium mb-3">{author.role}</p>
                    <p className="text-sm text-muted-foreground">{author.articles} article{author.articles !== 1 ? 's' : ''} published</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {author.bio}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="#email"
                    className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                    aria-label="Email"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                  <a
                    href="#twitter"
                    className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="#instagram"
                    className="w-10 h-10 rounded-full border border-border hover:border-primary hover:bg-muted transition-all flex items-center justify-center"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No authors found.</p>
            </div>
          )}
        </section>

        {/* Join Section */}
        <section className="text-center py-12 rounded-2xl bg-muted">
          <h2 className="text-3xl font-bold mb-4">Want to Contribute?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We're always looking for new voices and fresh perspectives. If you have a story to tell 
            or expertise to share, we'd love to hear from you.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Get in Touch
          </a>
        </section>
      </main>
    </div>
  );
};

export default Authors;
