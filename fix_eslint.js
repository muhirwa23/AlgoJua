import fs from 'fs';
import path from 'path';

// 1. DetailsDialog.tsx
let ddPath = path.join('src', 'components', 'DetailsDialog.tsx');
if (fs.existsSync(ddPath)) {
  let content = fs.readFileSync(ddPath, 'utf8');
  content = content.replace(/item: any/g, 'item: unknown');
  fs.writeFileSync(ddPath, content);
}

// 2. ui/command.tsx
let cmdPath = path.join('src', 'components', 'ui', 'command.tsx');
if (fs.existsSync(cmdPath)) {
  let content = fs.readFileSync(cmdPath, 'utf8');
  content = content.replace(/export interface CommandDialogProps extends DialogProps {}/g, 'export type CommandDialogProps = DialogProps;');
  fs.writeFileSync(cmdPath, content);
}

// 3. ui/textarea.tsx
let taPath = path.join('src', 'components', 'ui', 'textarea.tsx');
if (fs.existsSync(taPath)) {
  let content = fs.readFileSync(taPath, 'utf8');
  content = content.replace(/export interface TextareaProps\s+extends React\.TextareaHTMLAttributes<HTMLTextAreaElement> \{\}/g, 'export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;');
  fs.writeFileSync(taPath, content);
}

// 4. lib/api.ts
let apiPath = path.join('src', 'lib', 'api.ts');
if (fs.existsSync(apiPath)) {
  let content = fs.readFileSync(apiPath, 'utf8');
  content = content.replace(/: any/g, ': unknown');
  fs.writeFileSync(apiPath, content);
}

// 5. pages/JobDetails.tsx
let jdPath = path.join('src', 'pages', 'JobDetails.tsx');
if (fs.existsSync(jdPath)) {
  let content = fs.readFileSync(jdPath, 'utf8');
  content = content.replace(/recJob as any/g, 'recJob as unknown as Record<string, unknown>');
  fs.writeFileSync(jdPath, content);
}

// 6. tailwind.config.ts
let twPath = 'tailwind.config.ts';
if (fs.existsSync(twPath)) {
  let content = fs.readFileSync(twPath, 'utf8');
  content = content.replace(/require\("tailwindcss-animate"\)/g, '/* eslint-disable-next-line @typescript-eslint/no-require-imports */\n    require("tailwindcss-animate")');
  content = content.replace(/require\('@tailwindcss\/typography'\)/g, '/* eslint-disable-next-line @typescript-eslint/no-require-imports */\n    require(\'@tailwindcss/typography\')');
  fs.writeFileSync(twPath, content);
}

console.log('ESLint fixes applied.');
