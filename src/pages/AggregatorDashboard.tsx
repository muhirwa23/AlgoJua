import { useState } from "react";
import Header from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CheckCircle2, 
  XCircle, 
  Clock,
  ExternalLink,
  FileText,
  Rss,
  Download,
  TrendingUp
} from "lucide-react";

export function AggregatorDashboard() {
  const [platforms] = useState([
    {
      name: "Google News",
      status: "pending",
      icon: "🔍",
      url: "https://publishercenter.google.com",
      metrics: {
        crawls: 0,
        impressions: 0,
        clicks: 0
      },
      requirements: [
        { item: "NewsArticle Schema", completed: true },
        { item: "XML Sitemap", completed: true },
        { item: "Domain Verification", completed: false },
        { item: "3 Articles Posted", completed: false }
      ]
    },
    {
      name: "Apple News",
      status: "not_started",
      icon: "🍎",
      url: "https://news.publisher.apple.com",
      metrics: {
        articles: 0,
        views: 0,
        reads: 0
      },
      requirements: [
        { item: "ANF Export Support", completed: true },
        { item: "Publisher Account", completed: false },
        { item: "Logo (1024x1024)", completed: false },
        { item: "Content Guidelines", completed: false }
      ]
    },
    {
      name: "Bing News",
      status: "not_started",
      icon: "🔵",
      url: "https://www.bing.com/webmasters/pubhub",
      metrics: {
        submissions: 0,
        accepted: 0,
        views: 0
      },
      requirements: [
        { item: "RSS Feed Active", completed: true },
        { item: "Webmaster Verification", completed: false },
        { item: "Editorial Standards", completed: false }
      ]
    },
    {
      name: "Flipboard",
      status: "not_started",
      icon: "📱",
      url: "https://flipboard.com/rss",
      metrics: {
        followers: 0,
        flips: 0
      },
      requirements: [
        { item: "RSS Feed URL", completed: true },
        { item: "Topic Tags", completed: true }
      ]
    },
    {
      name: "SmartNews",
      status: "not_started",
      icon: "📰",
      url: "https://publishers.smartnews.com",
      metrics: {
        readers: 0
      },
      requirements: [
        { item: "RSS Feed", completed: true },
        { item: "Publisher Signup", completed: false }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Not Started</Badge>;
    }
  };

  const getCompletionPercentage = (requirements: any[]) => {
    const completed = requirements.filter(r => r.completed).length;
    return Math.round((completed / requirements.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="News Aggregator Dashboard"
        description="Monitor and manage your blog's integration with major news aggregators like Google News, Apple News, and more."
      />
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">News Aggregator Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor your blog's integration status with major news platforms
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="overview">
                <Rss className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="platforms">
                <Download className="h-4 w-4 mr-2" />
                Platforms
              </TabsTrigger>
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                Content
              </TabsTrigger>
              <TabsTrigger value="tools">
                <TrendingUp className="h-4 w-4 mr-2" />
                Tools
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">5</CardTitle>
                    <CardDescription>Total Platforms</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-yellow-600">1</CardTitle>
                    <CardDescription>Pending Review</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl text-green-600">0</CardTitle>
                    <CardDescription>Approved</CardDescription>
                  </CardHeader>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks to improve your aggregator presence</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Rss className="mr-2 h-4 w-4" />
                    Generate Google News Sitemap
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Export RSS Feed
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Run Compliance Check
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms" className="space-y-6">
              {platforms.map((platform) => (
                <Card key={platform.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{platform.icon}</span>
                        <div>
                          <CardTitle>{platform.name}</CardTitle>
                          <CardDescription>Readiness: {getCompletionPercentage(platform.requirements)}%</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(platform.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={getCompletionPercentage(platform.requirements)} className="h-2" />
                    
                    <div>
                      <h4 className="font-semibold mb-2">Requirements Checklist</h4>
                      <div className="space-y-2">
                        {platform.requirements.map((req, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            {req.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={req.completed ? "text-sm" : "text-sm text-muted-foreground"}>
                              {req.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {Object.keys(platform.metrics).length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Metrics</h4>
                        <div className="grid grid-cols-3 gap-4">
                          {Object.entries(platform.metrics).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-secondary rounded-lg">
                              <div className="text-2xl font-bold">{value}</div>
                              <div className="text-xs text-muted-foreground capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <a href={platform.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Platform
                        </a>
                      </Button>
                      <Button variant="outline">Setup Guide</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Content Compliance Status</CardTitle>
                  <CardDescription>Ensure your content meets aggregator standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Schema Markup</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">NewsArticle schema implemented</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Image Optimization</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Images meet 1200x675px requirement</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Author Information</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">Author bios and links present</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">Publish Dates</span>
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-sm text-muted-foreground">ISO 8601 format implemented</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Aggregator Tools</CardTitle>
                  <CardDescription>Utilities to manage your news feeds and submissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-between" variant="outline">
                    Generate Google News XML Sitemap
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Export RSS Feed (All Sections)
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Export Atom Feed
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Generate Apple News Format (ANF)
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Validate Content Compliance
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button className="w-full justify-between" variant="outline">
                    Check Core Web Vitals
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">📚 Setup Resources</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Google Publisher Center verification guide</li>
                    <li>• Apple News publisher onboarding documentation</li>
                    <li>• Bing Webmaster Tools setup instructions</li>
                    <li>• RSS feed optimization best practices</li>
                    <li>• Schema.org NewsArticle implementation examples</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default AggregatorDashboard;