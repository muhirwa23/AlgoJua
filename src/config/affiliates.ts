export interface AffiliateItem {
  id: string;
  title: string;
  description: string;
  category: "Hosting" | "Developer Tools" | "AI & Productive" | "Career & Books";
  url: string;
  buttonText: string;
  badge?: string;
  iconName?: string;
  isPopular?: boolean;
}

export const ALLOWED_AFFILIATE_DOMAINS = [
  "github.com",
  "amazon.com",
  "digitalocean.com",
  "vercel.com",
  "supabase.com",
  "jetbrains.com",
  "coursera.org",
  "udemy.com",
  "algojua.top",
];

export const AFFILIATE_RECOMMENDATIONS: AffiliateItem[] = [
  {
    id: "digitalocean",
    title: "DigitalOcean Cloud Infrastructure",
    description: "Deploy scalable cloud servers and managed Kubernetes with $200 free credit for new tech leads and developers.",
    category: "Hosting",
    url: "https://digitalocean.com/?ref=algojua",
    buttonText: "Get $200 Free Credit",
    badge: "Special Offer",
    isPopular: true,
  },
  {
    id: "jetbrains",
    title: "JetBrains All Products Pack",
    description: "The ultimate IDE suite for Web, Python, Go, and Java developers. Accelerate code quality and engineering productivity.",
    category: "Developer Tools",
    url: "https://jetbrains.com/?ref=algojua",
    buttonText: "Explore IDEs",
    badge: "Developer Favorite",
  },
  {
    id: "coursera-tech-career",
    title: "Professional Tech & Data Science Certificates",
    description: "Level up your resume with career certificates from Google, IBM, and Meta. High completion rates for remote roles.",
    category: "Career & Books",
    url: "https://coursera.org/?ref=algojua",
    buttonText: "Browse Certificates",
    badge: "Career Boost",
  },
];

export function isAllowedAffiliateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_AFFILIATE_DOMAINS.some(
      (domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch (err) {
    return false;
  }
}
