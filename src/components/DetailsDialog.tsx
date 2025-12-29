import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, DollarSign, TrendingUp, Building2, Globe, Clock, Zap, Users, Tag, MapPin, CheckCircle2, Rocket, Briefcase } from "lucide-react";

interface DetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: "jobs" | "tools" | "trends" | "opportunities";
}

export function DetailsDialog({ isOpen, onClose, data, type }: DetailsDialogProps) {
  if (!data) return null;

  const renderContent = () => {
    switch (type) {
      case "jobs":
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                <Briefcase className="w-3 h-3 mr-1" />
                {data.category}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                <DollarSign className="w-3 h-3 mr-1" />
                {data.salary}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                {data.location}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {data.type}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">{data.company}</h4>
                  <p className="text-sm text-muted-foreground">Company</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">About the Role</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Join {data.company} as a {data.title}. This is an exciting opportunity to work with a talented team in {data.location}. 
                  We are looking for passionate individuals ready to make an impact.
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Key Requirements</h4>
                <ul className="space-y-2">
                  {[1, 2, 3].map((_, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                      <span>Experience with relevant technologies and modern frameworks</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        );

      case "tools":
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">
                <Zap className="w-3 h-3 mr-1" />
                {data.category}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border-yellow-500/20">
                <Tag className="w-3 h-3 mr-1" />
                {data.pricing}
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">{data.description}</p>

              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.tags?.map((tag: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
                 <Users className="w-4 h-4" />
                 <span>Used by 50,000+ developers</span>
              </div>
            </div>
          </>
        );

      case "trends":
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-orange-500/20">
                <TrendingUp className="w-3 h-3 mr-1" />
                {data.growth} Growth
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
                <Users className="w-3 h-3 mr-1" />
                {data.views} Views
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <Clock className="w-3 h-3 mr-1" />
                {data.date}
              </Badge>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed">{data.description}</p>
              
              <div className="p-4 rounded-xl bg-muted/30 border border-border">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Why it's trending
                </h4>
                <p className="text-sm text-muted-foreground">
                  This topic has seen significant traction over the last 7 days, driven by industry announcements and social media engagement.
                </p>
              </div>
            </div>
          </>
        );

      case "opportunities":
        return (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                <DollarSign className="w-3 h-3 mr-1" />
                {data.value}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20">
                <Rocket className="w-3 h-3 mr-1" />
                {data.type}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 text-sm">
                <Calendar className="w-3 h-3 mr-1" />
                {data.deadline}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold">{data.organization}</h4>
                  <p className="text-sm text-muted-foreground">Organizer</p>
                </div>
              </div>

              <p className="text-lg leading-relaxed">{data.description}</p>

              <div className="flex items-center justify-between text-sm text-muted-foreground p-3 rounded-lg border border-border">
                 <span>Applicants</span>
                 <span className="font-semibold text-foreground">{data.applicants}</span>
              </div>
            </div>
          </>
        );
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "jobs": return "Apply Now";
      case "tools": return "Visit Website";
      case "trends": return "Read Full Report";
      case "opportunities": return "Apply Now";
      default: return "View Details";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 rounded-[2rem] border-0">
        <div className="relative h-64 w-full">
          <img 
            src={data.image} 
            alt={data.title || data.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </Button>
        </div>

        <div className="p-6 md:p-8 -mt-12 relative z-10 bg-background rounded-t-[2rem] shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
          <DialogHeader className="mb-6 text-left">
            <DialogTitle className="text-3xl font-bold tracking-tight mb-2">
              {data.title || data.name}
            </DialogTitle>
          </DialogHeader>

          {renderContent()}

          <DialogFooter className="mt-8 gap-3 sm:gap-0">
             <Button variant="outline" className="w-full sm:w-auto rounded-full h-12" onClick={onClose}>
              Maybe Later
             </Button>
             <Button className="w-full sm:w-auto rounded-full h-12 px-8 bg-primary hover:bg-primary/90 neon-button">
              {getButtonText()}
              <ExternalLink className="w-4 h-4 ml-2" />
             </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
