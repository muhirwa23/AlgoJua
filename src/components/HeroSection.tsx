import { ArrowRight, Zap, TrendingUp, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  articleCount?: number;
}

const HeroSection = ({ articleCount = 0 }: HeroSectionProps) => {
  return (
    <section className="relative w-full rounded-[2.5rem] overflow-hidden bg-[#0A0A0A] my-8 border border-white/5 shadow-2xl">
      {/* Soft atmospheric gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-80" />
      
      {/* Minimal grid pattern fading out at the bottom */}
      <div 
        className="absolute inset-0 grid-pattern opacity-[0.15]" 
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)' }} 
      />

      <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 p-8 md:p-12 lg:p-20">
        
        {/* Left Content Area */}
        <div className="flex flex-col justify-center space-y-8 max-w-xl mx-auto lg:mx-0">
          
          {/* Subtle animated badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit backdrop-blur-md animate-fade-in shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-mono tracking-wide text-foreground/80 uppercase">
              Your Tech Career Starts Here
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight animate-slide-up text-white">
              Stay Ahead in
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-emerald-400 mt-2 block">
                Tech & Careers
              </span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-light animate-slide-up stagger-1">
              Your definitive source for tech job opportunities, emerging developer tools, industry trends, and deep career insights.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 animate-slide-up stagger-2">
            <Button 
              onClick={() => {
                const el = document.getElementById('articles');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium shadow-[0_0_30px_hsl(var(--primary)/0.25)] transition-all hover:scale-105"
            >
              Explore Articles
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button 
              onClick={() => window.location.href = '/jobs'}
              variant="outline" 
              className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-105 backdrop-blur-md"
            >
              Browse Jobs
            </Button>
          </div>

          {/* Minimalist Stats row */}
          <div className="flex items-center gap-8 md:gap-12 pt-8 animate-slide-up stagger-3 border-t border-white/5 mt-8">
            <div className="flex flex-col gap-1 pt-6">
              <span className="text-3xl font-display font-medium text-white">50K+</span>
              <span className="text-sm font-light text-muted-foreground uppercase tracking-wider">Readers</span>
            </div>
            <div className="flex flex-col gap-1 pt-6">
              <span className="text-3xl font-display font-medium text-white">{articleCount > 0 ? articleCount : '...'}</span>
              <span className="text-sm font-light text-muted-foreground uppercase tracking-wider">Articles</span>
            </div>
            <div className="flex flex-col gap-1 pt-6">
              <span className="text-3xl font-display font-medium text-white">Weekly</span>
              <span className="text-sm font-light text-muted-foreground uppercase tracking-wider">Updates</span>
            </div>
          </div>
        </div>

        {/* Right Feature Area - Floating Sleek Cards */}
        <div className="flex flex-col gap-4 justify-center lg:pl-10 relative mt-10 lg:mt-0">
          {/* Subtle background glow for the right section */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[120%] h-3/4 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

          {[
            {
              icon: Briefcase,
              title: "Job Opportunities",
              desc: "Remote & on-site tech roles handpicked from top engineering teams.",
              delay: "stagger-1"
            },
            {
              icon: Zap,
              title: "New Tools",
              desc: "Discover the absolute best AI platforms and new developer utilities.",
              delay: "stagger-2"
            },
            {
              icon: TrendingUp,
              title: "Tech Trends",
              desc: "Stay informed on architectural shifts and what's radically shaping the industry.",
              delay: "stagger-3"
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className={`group relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-white/10 hover:bg-white/[0.06] backdrop-blur-md transition-all duration-300 hover:scale-[1.02] cursor-pointer animate-scale-in ${feature.delay}`}
            >
              <div className="flex items-start gap-5 relative z-10">
                <div className="mt-0.5 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-500 shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white/90 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground/80 text-sm font-light mt-2 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
