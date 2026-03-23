import { useEffect } from 'react';
import { generateNewsArticleSchema, generateBreadcrumbSchema, generateOrganizationSchema, type ArticleSchemaData } from '@/lib/seo-utils';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: ArticleSchemaData;
  breadcrumbs?: Array<{ name: string; url: string }>;
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
}

export function SEOHead({
  title,
  description,
  image = '/logo.png',
  url,
  type = 'website',
  article,
  breadcrumbs,
  keywords,
  publishedTime,
  modifiedTime,
  author,
  section
}: SEOHeadProps) {
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullTitle = `${title} | Algo Jua`;
  
  useEffect(() => {
    document.title = fullTitle;
    
    const updateMeta = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.setAttribute('name', name);
        }
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };
    
    updateMeta('description', description);
    if (keywords && keywords.length > 0) {
      updateMeta('keywords', keywords.join(', '));
    }
    if (author) {
      updateMeta('author', author);
    }
    
    updateMeta('og:title', fullTitle, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', fullUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', 'Algo Jua', true);
    
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', fullTitle);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    
    if (type === 'article' && publishedTime) {
      updateMeta('article:published_time', publishedTime, true);
      if (modifiedTime) {
        updateMeta('article:modified_time', modifiedTime, true);
      }
      if (author) {
        updateMeta('article:author', author, true);
      }
      if (section) {
        updateMeta('article:section', section, true);
      }
      if (keywords) {
        keywords.forEach(keyword => {
          const tagMeta = document.createElement('meta');
          tagMeta.setAttribute('property', 'article:tag');
          tagMeta.setAttribute('content', keyword);
          document.head.appendChild(tagMeta);
        });
      }
    }
    
    let schemaScript = document.querySelector('script[data-schema="organization"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('data-schema', 'organization');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(generateOrganizationSchema());
    
    if (article) {
      let articleSchema = document.querySelector('script[data-schema="article"]');
      if (!articleSchema) {
        articleSchema = document.createElement('script');
        articleSchema.setAttribute('type', 'application/ld+json');
        articleSchema.setAttribute('data-schema', 'article');
        document.head.appendChild(articleSchema);
      }
      articleSchema.textContent = JSON.stringify(generateNewsArticleSchema(article));
    }
    
    if (breadcrumbs && breadcrumbs.length > 0) {
      let breadcrumbSchema = document.querySelector('script[data-schema="breadcrumb"]');
      if (!breadcrumbSchema) {
        breadcrumbSchema = document.createElement('script');
        breadcrumbSchema.setAttribute('type', 'application/ld+json');
        breadcrumbSchema.setAttribute('data-schema', 'breadcrumb');
        document.head.appendChild(breadcrumbSchema);
      }
      breadcrumbSchema.textContent = JSON.stringify(generateBreadcrumbSchema(breadcrumbs));
    }
  }, [title, description, image, fullUrl, type, article, breadcrumbs, keywords, publishedTime, modifiedTime, author, section, fullTitle]);
  
  return null;
}