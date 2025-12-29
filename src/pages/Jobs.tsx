import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { JobListing } from "@/components/JobListing";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, ArrowRight, Building2, TrendingUp, Users, Globe } from "lucide-react";
import { jobsApi, type Job } from "@/lib/api";

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const fetchedJobs = await jobsApi.fetchAll();
        setJobs(fetchedJobs);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobs();
  }, []);

  const jobCategories = [
    { name: "Engineering", icon: "💻", count: jobs.filter(j => j.category === "Engineering").length },
    { name: "Design", icon: "🎨", count: jobs.filter(j => j.category === "Design").length },
    { name: "Product", icon: "🚀", count: jobs.filter(j => j.category === "Product").length },
    { name: "Marketing", icon: "📈", count: jobs.filter(j => j.category === "Marketing").length },
    { name: "Sales", icon: "💼", count: jobs.filter(j => j.category === "Sales").length },
    { name: "Other", icon: "✨", count: jobs.filter(j => !["Engineering", "Design", "Product", "Marketing", "Sales"].includes(j.category)).length }
  ];

  const featuredJobs = jobs.map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.type,
    category: job.category,
    salary: job.salary,
    image: job.image_url,
    tags: job.tags,
    applicants: job.applicants
  }));

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead
        title="Tech Jobs & Careers"
        description="Browse the latest tech jobs and career opportunities from top companies. Find your dream job in engineering, design, product, marketing, and more."
        keywords={["tech jobs", "software engineer jobs", "remote jobs", "startup careers", "tech careers"]}
        section="Jobs"
      />
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section styled like Index.tsx */}
        <section className="relative rounded-[2rem] overflow-hidden bg-card my-8 animate-fade-in grid-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-card via-card/95 to-transparent" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 md:gap-12 p-6 md:p-12 lg:p-16">
              <div className="flex flex-col justify-center space-y-6 md:space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit animate-slide-down">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-blue-500">{isLoading ? '...' : jobs.length} Open Positions</span>
                </div>

              <div className="space-y-4 md:space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight animate-slide-up">
                  Find Your
                  <span className="text-gradient block mt-2">Dream Job</span>
                </h1>
                <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl animate-slide-up stagger-1">
                  Curated opportunities from the world's best tech companies. Remote-first, competitive salaries, amazing culture.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4 animate-slide-up stagger-2">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium neon-button group w-full sm:w-auto">
                  Explore Jobs
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" className="rounded-full px-8 py-6 text-base font-medium border-border hover:bg-secondary w-full sm:w-auto">
                  Post a Job
                </Button>
              </div>

                  <div className="flex items-center gap-8 pt-6 animate-slide-up stagger-3">
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-gradient">{isLoading ? '...' : `${jobs.length}+`}</p>
                      <p className="text-sm text-muted-foreground">Open Roles</p>
                    </div>
                    <div className="w-px h-12 bg-border" />
                    <div className="text-center">
                      <p className="text-2xl md:text-3xl font-bold text-gradient-accent">{isLoading ? '...' : `${new Set(jobs.map(j => j.company)).size}+`}</p>
                      <p className="text-sm text-muted-foreground">Companies</p>
                    </div>
                  </div>
            </div>

            <div className="flex flex-col gap-4 justify-center">
               <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-1">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-blue-500 transition-colors">Remote First</h3>
                    <p className="text-muted-foreground text-sm mt-1">Work from anywhere in the world</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-green-500 transition-colors">Competitive Pay</h3>
                    <p className="text-muted-foreground text-sm mt-1">Top-tier salaries and equity packages</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 hover:scale-[1.02] transition-all cursor-pointer group animate-scale-in stagger-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">Great Culture</h3>
                    <p className="text-muted-foreground text-sm mt-1">Join teams that value collaboration</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

            <section id="jobs" className="py-12">
              <div className="flex items-center justify-between mb-12 animate-slide-up">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Featured Jobs</h2>
                  <p className="text-muted-foreground mt-2">Hand-picked opportunities from top companies</p>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="h-48 bg-slate-800 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : featuredJobs.length > 0 ? (
                <JobListing jobs={featuredJobs} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No jobs available at the moment. Check back soon!</p>
                </div>
              )}
              </section>
        </main>
      </div>
  );
}

export default Jobs;