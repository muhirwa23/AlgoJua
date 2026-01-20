import { ArrowRight, Zap, TrendingUp, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative rounded-[2rem] overflow-hidden bg-card my-8 animate-fade-in grid-pattern">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-transparent" />
      
      <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
        {/* Left side - Content */}
        <div className="flex flex-col justify-center space-y-6 md:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 w-fit animate-slide-down">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Your Tech Career Starts Here</span>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-slide-up">
              Stay Ahead in
              <span className="text-gradient block mt-2">Tech & Careers</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
              Your go-to source for tech job opportunities, emerging tools, industry trends, and career insights. 
              No fluff, just actionable content.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4 animate-slide-up stagger-2">
            <Button 
              onClick={() => {
                const el = document.getElementById('articles');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative bg-primary hover:bg-primary/90 text-black rounded-full px-10 py-7 text-lg font-bold group w-full sm:w-auto overflow-hidden shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)] transition-all duration-500 hover:-translate-y-1.5 active:scale-95 border-none"
            >
              <span className="relative z-10 flex items-center gap-3">
                Explore Articles
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Button>

            <Button 
              onClick={() => window.location.href = '/jobs'}
              variant="outline" 
              className="relative rounded-full px-10 py-7 text-lg font-bold border-2 border-primary/20 bg-background/40 backdrop-blur-md hover:bg-primary/10 hover:border-primary/60 text-foreground w-full sm:w-auto transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)] group active:scale-95"
            >
              <Briefcase className="mr-3 w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
              Browse Jobs
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-6 animate-slide-up stagger-3">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient">50K+</p>
              <p className="text-sm text-muted-foreground">Readers</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient-accent">200+</p>
              <p className="text-sm text-muted-foreground">Articles</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient">Weekly</p>
              <p className="text-sm text-muted-foreground">Updates</p>
            </div>
          </div>
        </div>

        {/* Right side - Feature Cards */}
        <div className="flex flex-col gap-4 justify-center">
          <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-1">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--tag-jobs))] flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Job Opportunities</h3>
                <p className="text-muted-foreground text-sm mt-1">Curated remote and on-site tech roles from top companies</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-2">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--tag-tools))] flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">New Tools</h3>
                <p className="text-muted-foreground text-sm mt-1">Discover the latest AI tools and developer utilities</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-3">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--tag-trends))] flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-background" />
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">Tech Trends</h3>
                <p className="text-muted-foreground text-sm mt-1">Stay informed on what's shaping the industry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
