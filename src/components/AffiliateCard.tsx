import React from "react";
import { ExternalLink, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type AffiliateItem, isAllowedAffiliateUrl } from "@/config/affiliates";
import { trackEvent } from "@/lib/analytics";

interface AffiliateCardProps {
  item: AffiliateItem;
  sourcePage?: string;
  className?: string;
}

export const AffiliateCard: React.FC<AffiliateCardProps> = ({
  item,
  sourcePage = "general",
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Validate domain safety
    if (!isAllowedAffiliateUrl(item.url)) {
      e.preventDefault();
      console.warn("Outbound affiliate link blocked by safety policy:", item.url);
      return;
    }

    // Track event
    trackEvent("affiliate_link_click", {
      affiliate_id: item.id,
      affiliate_title: item.title,
      category: item.category,
      source_page: sourcePage,
      destination_url: item.url,
    });
  };

  return (
    <Card className={`p-6 border-border/50 bg-card/60 backdrop-blur-sm hover:border-primary/30 transition-all ${className}`}>
      <div className="flex flex-col h-full justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              <Tag className="w-3 h-3 mr-1" />
              {item.category}
            </Badge>
            {item.badge && (
              <Badge className="text-[10px] uppercase tracking-wider bg-accent text-accent-foreground">
                {item.badge}
              </Badge>
            )}
          </div>

          <h3 className="font-bold text-lg text-foreground mb-2 leading-snug">
            {item.title}
          </h3>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 my-3">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />
            <span>Affiliate Disclosure: AlgoJua may earn a commission if you purchase through this verified link.</span>
          </div>

          <Button
            asChild
            className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium neon-button"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className="flex items-center justify-center gap-2"
            >
              <span>{item.buttonText}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AffiliateCard;
