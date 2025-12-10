import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { articles, Article } from "@/data/articles";

const SearchDialog = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);

  // Extract unique categories and authors
  const categories = useMemo(() => 
    [...new Set(articles.map(a => a.category))].sort(),
    []
  );
  
  const authors = useMemo(() => 
    [...new Set(articles.map(a => a.author.name))].sort(),
    []
  );

  // Filter articles based on search criteria
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesQuery = query.trim() === "" || 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
        article.author.name.toLowerCase().includes(query.toLowerCase()) ||
        article.category.toLowerCase().includes(query.toLowerCase());
      
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      const matchesAuthor = !selectedAuthor || article.author.name === selectedAuthor;
      
      return matchesQuery && matchesCategory && matchesAuthor;
    });
  }, [query, selectedCategory, selectedAuthor]);

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory(null);
    setSelectedAuthor(null);
  };

  const hasActiveFilters = query || selectedCategory || selectedAuthor;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 sm:p-2 rounded-full hover:bg-muted/60 transition-all"
          aria-label="Search articles"
        >
          <Search className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        {/* Search Header */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles by keyword, title, or tag..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-12 text-base rounded-full border-muted"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          
          {/* Filters */}
          <div className="mt-4 space-y-3">
            {/* Category Filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Categories</p>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setSelectedCategory(
                      selectedCategory === category ? null : category
                    )}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Author Filter */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Authors</p>
              <div className="flex flex-wrap gap-2">
                {authors.map(author => (
                  <Badge
                    key={author}
                    variant={selectedAuthor === author ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setSelectedAuthor(
                      selectedAuthor === author ? null : author
                    )}
                  >
                    {author}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters summary */}
          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredArticles.length} result{filteredArticles.length !== 1 ? "s" : ""} found
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No articles found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear filters and try again
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredArticles.map(article => (
                <SearchResultItem 
                  key={article.id} 
                  article={article} 
                  onSelect={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface SearchResultItemProps {
  article: Article;
  onSelect: () => void;
}

const SearchResultItem = ({ article, onSelect }: SearchResultItemProps) => {
  return (
    <a
      href={`/article/${article.id}`}
      onClick={onSelect}
      className="flex gap-4 p-3 rounded-xl hover:bg-muted/60 transition-all group"
    >
      <img
        src={article.image}
        alt={article.title}
        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="secondary" className="text-xs">
            {article.category}
          </Badge>
          <span className="text-xs text-muted-foreground">{article.readTime}</span>
        </div>
        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-1">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {article.subtitle}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          By {article.author.name}
        </p>
      </div>
    </a>
  );
};

export default SearchDialog;
