import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, DollarSign, Clock, ArrowRight, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  image: string;
  tags: string[];
  applicants: string;
}

interface JobListingProps {
  jobs: Job[];
}

export function JobListing({ jobs }: JobListingProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {jobs.map((job, index) => (
        <div 
          key={job.id} 
          className={`animate-slide-up stagger-${Math.min(index + 1, 6)}`}
        >
          <Card 
            className="group relative overflow-hidden border-border/40 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:border-primary/20 cursor-pointer"
            onClick={() => navigate(`/jobs/${job.id}`)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="p-6 sm:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center relative z-10">
              {/* Logo */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-muted overflow-hidden flex-shrink-0 border border-border/50 group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <img src={job.image} alt={job.company} className="w-full h-full object-cover" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="font-medium text-foreground/80">{job.company}</span>
                      <span>•</span>
                      <span className="text-sm">{job.applicants} applicants</span>
                    </div>
                  </div>
                  
                    {/* Action Button - Desktop Position */}
                    <div className="hidden md:block">
                       <Button 
                         className="rounded-full px-6 bg-secondary/50 hover:bg-primary hover:text-primary-foreground text-secondary-foreground transition-all duration-300"
                         onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/jobs/${job.id}`);
                         }}
                       >
                        View Details
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 sm:gap-x-6 text-sm text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                    <Briefcase className="w-3.5 h-3.5 text-primary" />
                    {job.type}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 border border-border/50">
                    <DollarSign className="w-3.5 h-3.5 text-primary" />
                    {job.salary}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs px-2.5 py-0.5 font-medium border-primary/20 bg-primary/5 text-primary/80 group-hover:bg-primary/10 transition-colors"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Button - Mobile Position */}
              <div className="md:hidden w-full pt-2">
                <Button 
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/jobs/${job.id}`);
                  }}
                >
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
