import { useState, useEffect } from "react";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchDialog from "@/components/SearchDialog";
import { SubscribeDialog } from "./SubscribeDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const shouldBeDark = savedTheme !== "light";
    
    setIsDark(shouldBeDark);
    if (!shouldBeDark) {
      document.documentElement.classList.add("light");
    }

    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
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

  const navLinkStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    transition: 'all 0.2s',
    textDecoration: 'none',
    color: 'inherit'
  };

  return (
    <header 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        padding: '0.5rem 0'
      }}
    >
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 0.75rem' }}>
        <div 
          className="pill-nav"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            height: '3.5rem',
            padding: '0 1rem'
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.025em' }}>
                Algo <span className="text-primary">Jua</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          {isDesktop && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <a href="/" className="hover:bg-secondary hover:text-primary" style={navLinkStyle}>
                Home
              </a>
              <a href="/#articles" className="hover:bg-secondary hover:text-primary" style={navLinkStyle}>
                Articles
              </a>
              <a href="/jobs" className="hover:bg-secondary hover:text-primary" style={navLinkStyle}>
                Jobs
              </a>
              <a href="/growth" className="hover:bg-secondary hover:text-primary" style={navLinkStyle}>
                Growth
              </a>
            </nav>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <SearchDialog />
            
            <button
              onClick={toggleTheme}
              className="hover:bg-secondary"
              style={{ 
                padding: '0.5rem', 
                borderRadius: '9999px', 
                transition: 'all 0.2s',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun style={{ width: '1.25rem', height: '1.25rem' }} />
              ) : (
                <Moon style={{ width: '1.25rem', height: '1.25rem' }} />
              )}
            </button>
            
              {isDesktop && (
                <Button 
                  onClick={() => setIsSubscribeOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground neon-button" 
                  style={{ borderRadius: '9999px', padding: '0.5rem 1.5rem', fontWeight: 500 }}
                >
                  Subscribe
                </Button>
              )}

              {/* Mobile Menu Button */}

            {!isDesktop && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
                style={{ 
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isMenuOpen ? <X style={{ width: '1.5rem', height: '1.5rem' }} /> : <Menu style={{ width: '1.5rem', height: '1.5rem' }} />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && !isDesktop && (
          <div 
            className="glass-card"
            style={{ 
              padding: '1rem', 
              marginTop: '0.5rem',
              animation: 'fadeIn 0.3s ease-out'
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/" className="hover:text-primary hover:bg-secondary" style={{ ...navLinkStyle, display: 'block', borderRadius: '0.5rem' }}>
                Home
              </a>
              <a href="/#articles" className="hover:text-primary hover:bg-secondary" style={{ ...navLinkStyle, display: 'block', borderRadius: '0.5rem' }}>
                Articles
              </a>
              <a href="/jobs" className="hover:text-primary hover:bg-secondary" style={{ ...navLinkStyle, display: 'block', borderRadius: '0.5rem' }}>
                Jobs
              </a>
              <a href="/growth" className="hover:text-primary hover:bg-secondary" style={{ ...navLinkStyle, display: 'block', borderRadius: '0.5rem' }}>
                Growth
              </a>

                <Button 
                  onClick={() => setIsSubscribeOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground neon-button" 
                  style={{ borderRadius: '9999px', width: '100%', marginTop: '0.5rem' }}
                >
                  Subscribe
                </Button>
              </nav>
            </div>
          )}
        </div>
        <SubscribeDialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen} />
      </header>

  );
};

export default Header;
