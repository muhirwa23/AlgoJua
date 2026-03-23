import { createClient } from 'contentful';

const space = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;
const previewToken = import.meta.env.VITE_CONTENTFUL_PREVIEW_TOKEN;
const environment = import.meta.env.VITE_CONTENTFUL_ENVIRONMENT || 'master';

if (!space || !accessToken) {
  console.error('Contentful Space ID or Access Token is missing in .env');
}

export const client = createClient({
  space: space || '',
  accessToken: accessToken || '',
  environment,
});

export const previewClient = createClient({
  space: space || '',
  accessToken: previewToken || '',
  host: 'preview.contentful.com',
  environment,
});

