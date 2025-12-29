import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Calendar, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  Users,
  CheckCircle2
} from "lucide-react";
import { jobsApi, type Job } from "@/lib/api";

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      if (!id) {
        setJob(null);
        setIsLoading(false);
        return;
      }

      try {
        const fetchedJob = await jobsApi.fetchById(id);
        if (!fetchedJob) {
          setJob(null);
        } else {
          setJob(fetchedJob);
          
          const allJobs = await jobsApi.fetchAll();
          const recommended = allJobs
            .filter(j => j.id !== id)
            .filter(j => 
              j.category === fetchedJob.category || 
              j.location === fetchedJob.location ||
              j.tags.some(tag => fetchedJob.tags.includes(tag))
            )
            .slice(0, 3);
          
          setRecommendedJobs(recommended);
        }
      } catch (error) {
        console.error('Failed to load job:', error);
        setJob(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-800 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-slate-800 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead
          title="Job Not Found"
          description="The job you're looking for doesn't exist"
          section="Jobs"
        />
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
          <p className="text-muted-foreground mb-8">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/jobs')} className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <SEOHead
        title={`${job.title} at ${job.company}`}
        description={job.description}
        keywords={[job.title, job.company, job.category, ...job.tags]}
        section="Jobs"
      />
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/jobs')}
          className="mb-6 hover:bg-secondary rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="p-8 border-border/40 bg-card/40 backdrop-blur-sm animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
                <div className="w-20 h-20 rounded-2xl bg-muted overflow-hidden border border-border/50 shadow-sm flex-shrink-0">
                  <img src={job.image_url} alt={job.company} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 space-y-2 min-w-0">
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{job.title}</h1>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium text-foreground">{job.company}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{job.applicants} applicants</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 border border-border/50">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 border border-border/50">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{job.type}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 border border-border/50">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{job.salary}</span>
                </div>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-background/50 border border-border/50">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Posted {new Date(job.date_posted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pb-6 border-b border-border/50">
                {job.tags.map((tag) => (
                  <Badge 
                    key={tag}
                    variant="outline"
                    className="px-3 py-1 font-medium border-primary/20 bg-primary/5 text-primary/80"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="space-y-6 pt-6">
                <section>
                  <h2 className="text-2xl font-bold mb-4">About the Role</h2>
                  <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Responsibilities</h2>
                  <ul className="space-y-3">
                    {job.responsibilities.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-bold mb-4">Requirements</h2>
                  <ul className="space-y-3">
                    {job.requirements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </Card>

            {recommendedJobs.length > 0 && (
              <section className="animate-slide-up stagger-1">
                <h2 className="text-2xl font-bold mb-4">Recommended Jobs</h2>
                <div className="space-y-4">
                  {recommendedJobs.map((recJob) => (
                    <Card 
                      key={recJob.id}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 p-6 border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 hover:border-primary/20"
                      onClick={() => navigate(`/jobs/${recJob.id}`)}
                    >
                      <div className="flex gap-4 items-start">
                        <div className="w-14 h-14 rounded-xl bg-muted overflow-hidden border border-border/50 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <img src={recJob.image_url} alt={recJob.company} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-1">
                            {recJob.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <span className="font-medium text-foreground/80">{recJob.company}</span>
                            <span>•</span>
                            <span>{recJob.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {recJob.tags.slice(0, 3).map((tag) => (
                              <Badge 
                                key={tag}
                                variant="outline"
                                className="text-xs px-2 py-0.5 border-primary/20 bg-primary/5 text-primary/80"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 border-border/40 bg-card/40 backdrop-blur-sm sticky top-24 animate-slide-up stagger-1">
              <h3 className="text-lg font-bold mb-4">Apply for this role</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Join {job.company} and work on exciting projects with a talented team.
              </p>
              <Button 
                className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 neon-button mb-4"
                onClick={() => window.open(job.application_url, '_blank')}
              >
                Apply Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline"
                className="w-full rounded-full border-border hover:bg-secondary"
              >
                Save Job
              </Button>

              <div className="mt-6 pt-6 border-t border-border/50 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Job Type</p>
                  <p className="font-medium">{job.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="font-medium">{job.category}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Salary Range</p>
                  <p className="font-medium">{job.salary}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default JobDetails;
