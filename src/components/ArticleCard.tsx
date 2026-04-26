import { ArrowUpRight } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  category: string;
  date: string;
  image: string;
  slug?: string;
  size?: "small" | "large";
}

const ArticleCard = ({ id, title, category, date, image, slug, size = "small" }: ArticleCardProps) => {
  const articleUrl = slug ? `/blog/${slug}` : `/article/${id}`;

  return (
    <a
      href={articleUrl}
      className={`group flex flex-col gap-4 cursor-pointer block ${
        size === "large" ? "col-span-1 md:col-span-2 row-span-2" : ""
      }`}
    >
      {/* Image container */}
      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-xl bg-muted">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-opacity"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white font-medium text-lg flex items-center gap-2">
            Read More
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 px-0.5">
        <h3 className="text-xl md:text-2xl font-serif text-foreground leading-snug tracking-tight group-hover:text-primary transition-colors">
          {title}
        </h3>
        <span className="text-[13px] text-muted-foreground font-mono mt-1 tracking-tight">
          {date}
        </span>
      </div>
    </a>
  );
};

export default ArticleCard;
