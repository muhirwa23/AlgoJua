import fs from 'fs';
import path from 'path';

function fixFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const { oldStr, newStr } of replacements) {
    content = content.replace(oldStr, newStr);
  }
  fs.writeFileSync(filePath, content);
}

// 1. src/lib/performance.ts
try {
  fs.unlinkSync(path.join('src', 'lib', 'performance.ts'));
} catch (e) {}

// 2. src/pages/AITools.tsx
let aiToolsPath = path.join('src', 'pages', 'AITools.tsx');
let aiToolsContent = fs.readFileSync(aiToolsPath, 'utf8');
aiToolsContent = aiToolsContent.replace(/metric=\{`\$\{tool\.rating\}★`\}\s+summary=\{`\$\{tool\.pricing\} • \$\{tool\.description\}`\}\s+image=\{tool\.image\}\s+size="small"\s+type="tools"/g, 'image={tool.image}\n                  size="small"');
fs.writeFileSync(aiToolsPath, aiToolsContent);

// 3. src/pages/Opportunities.tsx
let oppPath = path.join('src', 'pages', 'Opportunities.tsx');
let oppContent = fs.readFileSync(oppPath, 'utf8');
oppContent = oppContent.replace(/metric=\{opp\.value\}\s+summary=\{opp\.description\}\s+image=\{opp\.image\}\s+size="small"\s+type="opportunities"/g, 'image={opp.image}\n                  size="small"');
fs.writeFileSync(oppPath, oppContent);

// 4. src/pages/Creativity.tsx
let crPath = path.join('src', 'pages', 'Creativity.tsx');
let crContent = fs.readFileSync(crPath, 'utf8');
crContent = crContent.replace(/avatar:\s*post\.author_avatar,\s*bio:\s*post\.author_bio/g, 'avatar: "",\n      bio: ""');
fs.writeFileSync(crPath, crContent);

// 5. src/pages/Growth.tsx
let grPath = path.join('src', 'pages', 'Growth.tsx');
let grContent = fs.readFileSync(grPath, 'utf8');
grContent = grContent.replace(/avatar:\s*post\.author_avatar,\s*bio:\s*post\.author_bio/g, 'avatar: "",\n      bio: ""');
fs.writeFileSync(grPath, grContent);

// 6. src/pages/Index.tsx
let idxPath = path.join('src', 'pages', 'Index.tsx');
let idxContent = fs.readFileSync(idxPath, 'utf8');
idxContent = idxContent.replace(/avatar:\s*post\.author_avatar,\s*bio:\s*post\.author_bio/g, 'avatar: "",\n      bio: ""');
fs.writeFileSync(idxPath, idxContent);

// 7. src/pages/Travel.tsx
let trPath = path.join('src', 'pages', 'Travel.tsx');
let trContent = fs.readFileSync(trPath, 'utf8');
trContent = trContent.replace(/avatar:\s*post\.author_avatar,\s*bio:\s*post\.author_bio/g, 'avatar: "",\n      bio: ""');
fs.writeFileSync(trPath, trContent);

// 8. src/pages/Wellness.tsx
let wlPath = path.join('src', 'pages', 'Wellness.tsx');
let wlContent = fs.readFileSync(wlPath, 'utf8');
wlContent = wlContent.replace(/avatar:\s*post\.author_avatar,\s*bio:\s*post\.author_bio/g, 'avatar: "",\n      bio: ""');
fs.writeFileSync(wlPath, wlContent);

// 9. src/pages/JobDetails.tsx
let jdPath = path.join('src', 'pages', 'JobDetails.tsx');
let jdContent = fs.readFileSync(jdPath, 'utf8');
// remove {recJob.tags.slice(0, 3).map((tag) => (...))} wrapper
// wait, the error is property 'tags' does not exist on type 'Job'
// we can replace recJob.tags with (recJob as any).tags || []
jdContent = jdContent.replace(/recJob\.tags/g, '((recJob as any).tags || [])');
fs.writeFileSync(jdPath, jdContent);

// 10. src/pages/Jobs.tsx
let jPath = path.join('src', 'pages', 'Jobs.tsx');
let jContent = fs.readFileSync(jPath, 'utf8');
jContent = jContent.replace(/tags:\s*job\.tags,\s*applicants:\s*job\.applicants/g, 'tags: [],\n    applicants: 0');
fs.writeFileSync(jPath, jContent);

// 11. src/pages/Trends.tsx
let tPath = path.join('src', 'pages', 'Trends.tsx');
let tContent = fs.readFileSync(tPath, 'utf8');
tContent = tContent.replace(/subtitle=\{trend\.subtitle\}\s+category=\{trend\.category\}\s+date=\{trend\.date\}\s+readTime=\{trend\.readTime\}\s+image=\{trend\.image\}\s+author=\{\{\s*name:\s*trend\.author,\s*avatar:\s*trend\.author_avatar,\s*bio:\s*trend\.author_bio\s*\}\}\s+content=\{trend\.content\}\s+tags=\{trend\.tags\}\s+size="small"/g, 'category={trend.category}\n                      date={trend.date}\n                      image={trend.image}\n                      size="small"');
fs.writeFileSync(tPath, tContent);

console.log('Fixes applied.');
