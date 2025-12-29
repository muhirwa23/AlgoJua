import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface SEOFieldsProps {
  formData: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    ogImage: string;
    slug: string;
  };
  onChange: (field: string, value: string) => void;
}

export function SEOFields({ formData, onChange }: SEOFieldsProps) {
  return (
    <Card className="bg-slate-950 border-slate-800">
      <CardHeader>
        <CardTitle>SEO Metadata</CardTitle>
        <CardDescription>Optimize your post for search engines and social sharing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="metaTitle">Meta Title</Label>
          <Input
            id="metaTitle"
            value={formData.metaTitle}
            onChange={(e) => onChange('metaTitle', e.target.value)}
            placeholder="SEO optimized title (defaults to post title)"
            className="bg-slate-900 border-slate-700"
            maxLength={60}
          />
          <p className="text-xs text-slate-400">{formData.metaTitle.length}/60 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaDescription">Meta Description</Label>
          <Textarea
            id="metaDescription"
            value={formData.metaDescription}
            onChange={(e) => onChange('metaDescription', e.target.value)}
            placeholder="Brief description for search results (defaults to subtitle)"
            rows={3}
            className="bg-slate-900 border-slate-700"
            maxLength={160}
          />
          <p className="text-xs text-slate-400">{formData.metaDescription.length}/160 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Meta Keywords</Label>
          <Input
            id="metaKeywords"
            value={formData.metaKeywords}
            onChange={(e) => onChange('metaKeywords', e.target.value)}
            placeholder="keyword1, keyword2, keyword3"
            className="bg-slate-900 border-slate-700"
          />
          <p className="text-xs text-slate-400">Comma-separated keywords for SEO</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => onChange('slug', e.target.value)}
            placeholder="url-friendly-slug (auto-generated from title if empty)"
            className="bg-slate-900 border-slate-700"
          />
          <p className="text-xs text-slate-400">Lowercase, hyphens only. Auto-generated if left empty.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ogImage">Open Graph Image URL</Label>
          <Input
            id="ogImage"
            value={formData.ogImage}
            onChange={(e) => onChange('ogImage', e.target.value)}
            placeholder="https://... (defaults to featured image)"
            className="bg-slate-900 border-slate-700"
          />
          <p className="text-xs text-slate-400">Image for social media sharing</p>
        </div>
      </CardContent>
    </Card>
  );
}
