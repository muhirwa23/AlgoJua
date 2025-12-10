import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchDialog from "@/components/SearchDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldBeDark = savedTheme !== "light";
    
    setIsDark(shouldBeDark);
    if (!shouldBeDark) {
      document.documentElement.classList.add("light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 py-2 sm:py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 pill-nav px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center min-w-0">
            <a href="/" className="flex items-center gap-1.5 sm:gap-2 group">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:animate-pulse-glow transition-all">
                <span className="text-primary-foreground font-bold text-base sm:text-lg font-mono">⚡</span>
              </div>
              <span className="text-base sm:text-xl font-bold tracking-tight">
                Tech<span className="text-primary">Pulse</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="/" className="text-sm font-medium hover:bg-secondary rounded-full px-4 py-2 transition-all hover:text-primary">
              Home
            </a>
            <a href="/#articles" className="text-sm font-medium hover:bg-secondary rounded-full px-4 py-2 transition-all hover:text-primary">
              Articles
            </a>
            <a href="/wellness" className="text-sm font-medium hover:bg-secondary rounded-full px-4 py-2 transition-all hover:text-primary">
              Jobs
            </a>
            <a href="/travel" className="text-sm font-medium hover:bg-secondary rounded-full px-4 py-2 transition-all hover:text-primary">
              Tools
            </a>
            <a href="/growth" className="text-sm font-medium hover:bg-secondary rounded-full px-4 py-2 transition-all hover:text-primary">
              Trends
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <SearchDialog />
            
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-full hover:bg-secondary transition-all"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            
            <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2 font-medium neon-button">
              Subscribe
            </Button>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-1.5 sm:p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 px-4 mt-2 glass-card animate-fade-in">
            <nav className="flex flex-col gap-2">
              <a href="/" className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-secondary">
                Home
              </a>
              <a href="/#articles" className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-secondary">
                Articles
              </a>
              <a href="/wellness" className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-secondary">
                Jobs
              </a>
              <a href="/travel" className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-secondary">
                Tools
              </a>
              <a href="/growth" className="text-sm font-medium hover:text-primary transition-colors py-2 px-3 rounded-lg hover:bg-secondary">
                Trends
              </a>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full mt-2 neon-button">
                Subscribe
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
