import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import HeroSection from "@/components/HeroSection";
import { articles } from "@/data/articles";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const featuredArticles = articles.slice(0, 6);

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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Articles</h2>
              <p className="text-muted-foreground mt-2">Fresh insights on jobs, tools, and trends</p>
            </div>
            <a href="#all" className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group">
              View all 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArticles.map((article, index) => (
              <div key={article.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <ArticleCard {...article} size="small" />
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="my-20 rounded-[2rem] bg-card p-8 md:p-16 relative overflow-hidden animate-scale-in">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Weekly Newsletter</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Get the <span className="text-gradient">edge</span> in tech
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Join 10,000+ developers and tech professionals getting weekly curated job opportunities, 
              tool recommendations, and industry insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
              <input
                type="email"
                placeholder="you@example.com"
                className="flex-1 px-6 py-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
              />
              <Button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium neon-button">
                Subscribe
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-primary">Categories</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/wellness" className="hover:text-primary transition-colors">Jobs</a></li>
                <li><a href="/travel" className="hover:text-primary transition-colors">Tools</a></li>
                <li><a href="/creativity" className="hover:text-primary transition-colors">Trends</a></li>
                <li><a href="/growth" className="hover:text-primary transition-colors">Career</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/authors" className="hover:text-primary transition-colors">Writers</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/style-guide" className="hover:text-primary transition-colors">Style Guide</a></li>
                <li><a href="/#newsletter" className="hover:text-primary transition-colors">Newsletter</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-primary">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/privacy" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="/terms" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono">⚡</span>
              <span className="font-bold">Tech<span className="text-primary">Pulse</span></span>
            </div>
            <p className="text-sm text-muted-foreground">© 2024 TechPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
