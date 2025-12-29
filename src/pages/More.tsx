import Header from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Mail, Shield, BookOpen, Info, Gavel, Newspaper } from "lucide-react";

export function More() {
  const sections = [
    {
      title: "About Us",
      description: "Learn about our mission, team, and editorial standards",
      icon: Info,
      href: "/about",
      color: "blue"
    },
    {
      title: "Contact",
      description: "Get in touch with our editorial team",
      icon: Mail,
      href: "/contact",
      color: "green"
    },
    {
      title: "Privacy Policy",
      description: "How we handle your data and privacy",
      icon: Shield,
      href: "/privacy",
      color: "indigo"
    },
    {
      title: "Terms of Service",
      description: "Terms and conditions for using our platform",
      icon: Gavel,
      href: "/terms",
      color: "red"
    },
      {
        title: "All Articles",
        description: "Browse our complete article archive",
        icon: Newspaper,
        href: "/articles",
        color: "teal"
      }
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 hover:bg-blue-200",
    green: "bg-green-100 text-green-600 hover:bg-green-200",
    indigo: "bg-indigo-100 text-indigo-600 hover:bg-indigo-200",
    red: "bg-red-100 text-red-600 hover:bg-red-200",
    orange: "bg-orange-100 text-orange-600 hover:bg-orange-200",
    teal: "bg-teal-100 text-teal-600 hover:bg-teal-200",
    pink: "bg-pink-100 text-pink-600 hover:bg-pink-200"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="More Resources & Information"
        description="Explore additional resources, company information, editorial guidelines, and ways to connect with Algo Jua."
        keywords={["about", "contact", "resources", "editorial guidelines", "company information"]}
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">
              Explore More
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Additional resources, company information, and ways to connect with us
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <a key={section.title} href={section.href}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]} flex items-center justify-center mb-4 transition-colors`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                      <p className="text-muted-foreground">{section.description}</p>
                    </CardContent>
                  </Card>
                </a>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default More;