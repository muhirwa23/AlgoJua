import { useState, useEffect } from "react";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Rocket, Target, ArrowRight, Zap, Trophy, Handshake, Globe } from "lucide-react";

export function Opportunities() {
  const opportunityTypes = [
    { name: "Startups", icon: "🚀", count: 89 },
    { name: "Funding", icon: "💸", count: 156 },
    { name: "Partnerships", icon: "🤝", count: 234 },
    { name: "Grants", icon: "🎁", count: 67 },
    { name: "Competitions", icon: "🏆", count: 43 },
    { name: "Accelerators", icon: "⚡", count: 52 }
  ];

  const featuredOpportunities = [
    {
      id: "opp-1",
      title: "Y Combinator W25 Applications Open",
      type: "Accelerator",
      organization: "Y Combinator",
      deadline: "Jan 15, 2025",
      value: "$500K",
      description: "Join the world's most successful startup accelerator. Applications open for Winter 2025 batch.",
      image: "https://images.unsplash.com/photo-1559136555-930d72f1d30c?w=800&auto=format&fit=crop&q=60",
      tags: ["Startups", "Funding", "Mentorship"],
      applicants: "5,000+"
    },
    {
      id: "opp-2",
      title: "AI Innovation Grant Program",
      type: "Grant",
      organization: "Tech for Good Foundation",
      deadline: "Feb 1, 2025",
      value: "$100K - $1M",
      description: "Funding for AI projects focused on social impact and sustainable development.",
      image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=60",
      tags: ["AI", "Social Impact", "Research"],
      applicants: "2,100+"
    },
    {
      id: "opp-3",
      title: "Global Startup Competition 2025",
      type: "Competition",
      organization: "Web Summit",
      deadline: "Mar 10, 2025",
      value: "$250K",
      description: "Pitch your startup to top VCs and win funding, mentorship, and global exposure.",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop&q=60",
      tags: ["Pitch", "Networking", "Visibility"],
      applicants: "8,500+"
    },
    {
      id: "opp-4",
      title: "Climate Tech Fellowship",
      type: "Fellowship",
      organization: "Green Future",
      deadline: "Feb 28, 2025",
      value: "$80K Stipend",
      description: "A 12-month fellowship for entrepreneurs building solutions for climate change.",
      image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=60",
      tags: ["Climate", "Fellowship", "Green Tech"],
      applicants: "1,200+"
    },
    {
      id: "opp-5",
      title: "Seed Fund Application",
      type: "Funding",
      organization: "Ventures Global",
      deadline: "Rolling",
      value: "$2M",
      description: "Early stage seed funding for B2B SaaS companies with proven traction.",
      image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&auto=format&fit=crop&q=60",
      tags: ["SaaS", "B2B", "Seed"],
      applicants: "3,400+"
    },
    {
      id: "opp-6",
      title: "Techstars London 2025",
      type: "Accelerator",
      organization: "Techstars",
      deadline: "Dec 30, 2024",
      value: "$120K",
      description: "Three-month mentorship-driven accelerator program in London.",
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60",
      tags: ["London", "Accelerator", "Mentorship"],
      applicants: "4,100+"
    }
  ];

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead
        title="Business Opportunities & Funding"
        description="Discover funding opportunities, startup programs, grants, competitions, and partnerships to grow your business."
        keywords={["business opportunities", "startup funding", "grants", "accelerators", "venture capital"]}
        section="Opportunities"
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section styled like Index.tsx */}
        <section className="relative rounded-[2rem] overflow-hidden bg-card my-8 animate-fade-in grid-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-transparent" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
            <div className="flex flex-col justify-center space-y-6 md:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 w-fit animate-slide-down">
                <Rocket className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">641 Active Opportunities</span>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-slide-up">
                  Unlock Your
                  <span className="text-gradient block mt-2">Growth Potential</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
                  Curated funding, grants, competitions, and programs to accelerate your entrepreneurial journey.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 animate-slide-up stagger-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium neon-button group w-full sm:w-auto">
                  Find Funding
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 text-base font-medium border-border hover:bg-secondary w-full sm:w-auto">
                  Post Opportunity
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-6 animate-slide-up stagger-3">
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient">$50M+</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <p className="text-2xl md:text-3xl font-bold text-gradient-accent">600+</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
               <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-green-500 transition-colors">Accelerators</h3>
                    <p className="text-muted-foreground text-sm mt-1">Join top-tier programs like YC and Techstars</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-500 transition-colors">Competitions</h3>
                    <p className="text-muted-foreground text-sm mt-1">Win non-dilutive funding and global exposure</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Handshake className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">Partnerships</h3>
                    <p className="text-muted-foreground text-sm mt-1">Connect with enterprises for pilot programs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="opportunities" className="py-12">
          <div className="flex items-center justify-between mb-12 animate-slide-up">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Latest Opportunities</h2>
              <p className="text-muted-foreground mt-2">Fund your ideas and grow your business</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.map((opp, index) => (
              <div key={opp.id} className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}>
                <ArticleCard 
                  id={opp.id}
                  title={opp.title}
                  category={opp.type}
                  date={`Deadline: ${opp.deadline}`}
                  metric={opp.value}
                  summary={`${opp.organization} • ${opp.value} • ${opp.applicants} interested`}
                  image={opp.image}
                  size="small" 
                  type="opportunities"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Alert Section */}
        <section className="my-20 rounded-[2rem] bg-card p-8 md:p-16 relative overflow-hidden animate-scale-in">
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
              <Globe className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Global Opportunities</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
              Never Miss an <span className="text-gradient">Opportunity</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Get personalized alerts for grants, competitions, and funding opportunities that match your startup's profile.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-4">
              <input
                type="email"
                placeholder="founder@startup.com"
                className="flex-1 px-6 py-4 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all font-mono text-sm"
              />
              <Button className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium neon-button">
                Get Alerts
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Opportunities;