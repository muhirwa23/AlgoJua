export interface ArticleSchemaData {
  headline: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified: string;
  image: string | string[];
  publisher: {
    name: string;
    logo: string;
  };
  url: string;
  wordCount?: number;
  keywords?: string[];
  articleSection?: string;
}

export function generateNewsArticleSchema(data: ArticleSchemaData) {
  const images = Array.isArray(data.image) ? data.image : [data.image];
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": data.headline,
    "description": data.description,
    "image": images,
    "datePublished": data.datePublished,
    "dateModified": data.dateModified,
    "author": {
      "@type": "Person",
      "name": data.author.name,
      ...(data.author.url && { "url": data.author.url })
    },
    "publisher": {
      "@type": "Organization",
      "name": data.publisher.name,
      "logo": {
        "@type": "ImageObject",
        "url": data.publisher.logo
      }
    },
    "url": data.url,
    ...(data.wordCount && { "wordCount": data.wordCount }),
    ...(data.keywords && { "keywords": data.keywords.join(", ") }),
    ...(data.articleSection && { "articleSection": data.articleSection }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    }
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "Algo Jua",
    "url": typeof window !== 'undefined' ? window.location.origin : '',
    "logo": "/logo.png",
    "description": "Expert insights on Jobs, AI Tools, Trends, and Opportunities",
    "sameAs": []
  };
}

export interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  images?: Array<{
    url: string;
    title?: string;
    caption?: string;
  }>;
  news?: {
    publication: {
      name: string;
      language: string;
    };
    publication_date: string;
    title: string;
    keywords?: string;
    stock_tickers?: string;
  };
}

export function generateGoogleNewsSitemap(entries: SitemapEntry[]): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
  
  const urls = entries.map(entry => {
    let urlXml = `  <url>
    <loc>${escapeXml(entry.url)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>`;
    
    if (entry.news) {
      urlXml += `
    <news:news>
      <news:publication>
        <news:name>${escapeXml(entry.news.publication.name)}</news:name>
        <news:language>${entry.news.publication.language}</news:language>
      </news:publication>
      <news:publication_date>${entry.news.publication_date}</news:publication_date>
      <news:title>${escapeXml(entry.news.title)}</news:title>`;
      
      if (entry.news.keywords) {
        urlXml += `
      <news:keywords>${escapeXml(entry.news.keywords)}</news:keywords>`;
      }
      
      if (entry.news.stock_tickers) {
        urlXml += `
      <news:stock_tickers>${escapeXml(entry.news.stock_tickers)}</news:stock_tickers>`;
      }
      
      urlXml += `
    </news:news>`;
    }
    
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(img => {
        urlXml += `
    <image:image>
      <image:loc>${escapeXml(img.url)}</image:loc>`;
        if (img.title) urlXml += `
      <image:title>${escapeXml(img.title)}</image:title>`;
        if (img.caption) urlXml += `
      <image:caption>${escapeXml(img.caption)}</image:caption>`;
        urlXml += `
    </image:image>`;
      });
    }
    
    urlXml += `
  </url>`;
    return urlXml;
  }).join('\n');
  
  return `${header}\n${urls}\n</urlset>`;
}

export function generateRSSFeed(config: {
  title: string;
  description: string;
  link: string;
  language: string;
  items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
    author?: string;
    category?: string;
    guid?: string;
    enclosure?: {
      url: string;
      type: string;
      length: number;
    };
  }>;
}): string {
  const header = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <description>${escapeXml(config.description)}</description>
    <link>${escapeXml(config.link)}</link>
    <language>${config.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(config.link)}/rss.xml" rel="self" type="application/rss+xml"/>`;
  
  const items = config.items.map(item => `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      ${item.author ? `<author>${escapeXml(item.author)}</author>` : ''}
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
      <guid isPermaLink="true">${escapeXml(item.guid || item.link)}</guid>
      ${item.enclosure ? `<enclosure url="${escapeXml(item.enclosure.url)}" type="${item.enclosure.type}" length="${item.enclosure.length}"/>` : ''}
    </item>`).join('');
  
  return `${header}${items}
  </channel>
</rss>`;
}

export function generateAtomFeed(config: {
  title: string;
  subtitle: string;
  link: string;
  id: string;
  updated: string;
  author: {
    name: string;
    email?: string;
  };
  entries: Array<{
    title: string;
    link: string;
    id: string;
    updated: string;
    published: string;
    summary: string;
    content?: string;
    author?: {
      name: string;
    };
  }>;
}): string {
  const entries = config.entries.map(entry => `
  <entry>
    <title>${escapeXml(entry.title)}</title>
    <link href="${escapeXml(entry.link)}"/>
    <id>${escapeXml(entry.id)}</id>
    <updated>${entry.updated}</updated>
    <published>${entry.published}</published>
    <summary>${escapeXml(entry.summary)}</summary>
    ${entry.content ? `<content type="html">${escapeXml(entry.content)}</content>` : ''}
    ${entry.author ? `<author><name>${escapeXml(entry.author.name)}</name></author>` : ''}
  </entry>`).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(config.title)}</title>
  <subtitle>${escapeXml(config.subtitle)}</subtitle>
  <link href="${escapeXml(config.link)}"/>
  <id>${escapeXml(config.id)}</id>
  <updated>${config.updated}</updated>
  <author>
    <name>${escapeXml(config.author.name)}</name>
    ${config.author.email ? `<email>${escapeXml(config.author.email)}</email>` : ''}
  </author>${entries}
</feed>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function calculateReadTime(text: string): number {
  const wordsPerMinute = 225;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function calculateWordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

export function validateNewsArticle(article: {
  title: string;
  content: string;
  author: string;
  datePublished: Date;
  image: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!article.title || article.title.length < 10) {
    errors.push('Title must be at least 10 characters');
  }
  
  if (!article.title || article.title.length > 110) {
    errors.push('Title should not exceed 110 characters for optimal display');
  }
  
  const wordCount = calculateWordCount(article.content);
  if (wordCount < 80) {
    errors.push('Article must contain at least 80 words to be considered news content');
  }
  
  if (!article.author || article.author.trim() === '') {
    errors.push('Author name is required');
  }
  
  if (!article.datePublished) {
    errors.push('Publication date is required');
  } else if (article.datePublished > new Date()) {
    errors.push('Publication date cannot be in the future');
  }
  
  if (!article.image) {
    errors.push('Featured image is required (minimum 1200x675px recommended)');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export function detectClickbait(title: string): { isClickbait: boolean; score: number; triggers: string[] } {
  const clickbaitPatterns = [
    { pattern: /you won't believe/i, weight: 0.3 },
    { pattern: /shocking/i, weight: 0.2 },
    { pattern: /\d+ (tricks|secrets|ways|reasons|things)/i, weight: 0.2 },
    { pattern: /doctors hate/i, weight: 0.3 },
    { pattern: /one weird trick/i, weight: 0.3 },
    { pattern: /what happened next/i, weight: 0.2 },
    { pattern: /number \d+ will/i, weight: 0.2 },
    { pattern: /^(this|these) \w+ will/i, weight: 0.15 },
    { pattern: /^you need to see/i, weight: 0.2 }
  ];
  
  let score = 0;
  const triggers: string[] = [];
  
  clickbaitPatterns.forEach(({ pattern, weight }) => {
    if (pattern.test(title)) {
      score += weight;
      triggers.push(pattern.source);
    }
  });
  
  return {
    isClickbait: score >= 0.3,
    score,
    triggers
  };
}