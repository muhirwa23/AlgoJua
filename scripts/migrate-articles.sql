-- Populate database with all articles from articles.ts
-- Run this with: psql <connection_string> -f scripts/migrate-articles.sql

-- First, ensure the table exists (from DATABASE_SETUP.md)
CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  subtitle TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  author_bio TEXT NOT NULL DEFAULT 'Tech Writer & Content Creator',
  author_avatar TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  content_introduction TEXT,
  content_sections JSONB DEFAULT '[]'::jsonb,
  content_conclusion TEXT,
  tags TEXT[] DEFAULT '{}',
  read_time TEXT DEFAULT '5 min',
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image TEXT,
  slug TEXT
);

-- Insert all Trends articles
INSERT INTO posts (id, title, subtitle, category, image_url, author_name, author_bio, author_avatar, content_introduction, content_sections, content_conclusion, tags, read_time, date, meta_title, slug) VALUES
('trend-2', 'Remote Work Evolution: The 4-Day Work Week', 'Compressed schedules gain traction in global firms', 'Trends', 'https://images.unsplash.com/photo-1593642632823-8f78536788c6?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Major companies are trialing four-day work weeks to boost focus and retention without sacrificing output.', '[{"heading":"Results So Far","content":"Pilot teams report steady output with improved well-being and lower attrition."}]', 'Lean schedules are becoming a benefit lever for high-talent teams.', ARRAY['Remote','Work','Culture'], '3 min', '2024-11-07', '4-day work week trend', 'four-day-work-week'),
('trend-3', 'Sustainable Tech: Carbon-Negative Data Centers', 'Hyperscalers race to beat net-zero pledges', 'Trends', 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Operators are piloting carbon-negative data centers with on-site renewables, heat reuse, and novel cooling.', '[{"heading":"Tech Stack","content":"Liquid cooling, bio-based materials, and software-defined power routing cut energy waste."}]', 'Green infra is shifting from optics to competitive advantage in cloud selection.', ARRAY['Sustainability','Cloud','Infra'], '3 min', '2024-11-06', 'Carbon-negative data centers', 'carbon-negative-data-centers'),
('trend-4', 'The Rise of Vertical Social Networks', 'Niche communities replace broad feeds', 'Trends', 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Vertical social platforms focused on craft, careers, and hobbies are winning engagement over general networks.', '[{"heading":"Why Users Move","content":"Focused moderation, expert-led rooms, and higher signal-to-noise."}]', 'Communities with depth are becoming the new distribution channels.', ARRAY['Social','Community','Product'], '3 min', '2024-11-05', 'Vertical social networks trend', 'vertical-social-networks'),
('trend-5', 'Quantum Computing Breakthroughs', 'Utility-scale quantum edges closer', 'Trends', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'New error-correction milestones are pushing quantum from labs toward early utility for chemistry and logistics.', '[{"heading":"Breakthrough","content":"Stabler qubits with better coherence reduce error rates for practical workloads."}]', 'Quantum is moving from hype to hands-on pilots with measurable value.', ARRAY['Quantum','Research','Hardware'], '3 min', '2024-11-04', 'Quantum computing momentum', 'quantum-computing-breakthroughs'),
('trend-6', 'Digital Health & Longevity Tech', 'AI-driven diagnostics reshape preventive care', 'Trends', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'From biomarkers to personalized plans, AI health stacks are moving into mainstream clinics and consumer apps.', '[{"heading":"Where It Works","content":"Early disease detection, adaptive coaching, and remote monitoring improve adherence."}]', 'Preventive, personalized care is becoming the default expectation for digital health.', ARRAY['Health','AI','Longevity'], '3 min', '2024-11-03', 'Digital health and longevity', 'digital-health-longevity')
ON CONFLICT (id) DO NOTHING;

-- Insert key Jobs articles
INSERT INTO posts (id, title, subtitle, category, image_url, author_name, author_bio, author_avatar, content_introduction, content_sections, content_conclusion, tags, read_time, date, slug) VALUES
('job-1', 'Senior Frontend Engineer', 'Lead the edge of frontend performance at Vercel', 'Jobs', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Vercel is hiring a senior frontend engineer to craft lightning-fast experiences.', '[{"heading":"What You Will Drive","content":"Own core UI surfaces that power the Vercel dashboard."}]', 'If you obsess over fast, elegant frontend systems, this role is for you.', ARRAY['React','TypeScript','Vercel'], '4 min', '2024-12-05', 'senior-frontend-engineer-vercel'),
('job-2', 'Product Designer', 'Shape collaborative design at Figma', 'Jobs', 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Figma seeks a product designer to craft intuitive multiplayer experiences.', '[{"heading":"Where You Fit","content":"Design end-to-end journeys for creation, review, and developer handoff."}]', 'Help millions of makers build together with less drag and more delight.', ARRAY['Design','Figma','UI/UX'], '3 min', '2024-12-04', 'product-designer-figma')
ON CONFLICT (id) DO NOTHING;

-- Insert AI Tools articles
INSERT INTO posts (id, title, subtitle, category, image_url, author_name, author_bio, author_avatar, content_introduction, content_sections, content_conclusion, tags, read_time, date, slug) VALUES
('tool-1', 'ChatGPT Plus', 'GPT-4 powered conversational and creative help', 'AI Tools', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'ChatGPT Plus delivers faster, more capable responses for writing, coding, and research.', '[{"heading":"Use Cases","content":"Draft content, explore ideas, refactor code, and get reasoning support."}]', 'A versatile assistant for teams that need reliable AI on tap.', ARRAY['AI','Chatbot','Productivity'], '3 min', '2024-11-15', 'chatgpt-plus'),
('tool-2', 'Midjourney', 'High-fidelity image generation for creative teams', 'AI Tools', 'https://images.unsplash.com/photo-1686191128892-c2f85a4e6f5e?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'Midjourney turns text prompts into detailed artwork and production-ready assets.', '[{"heading":"Strengths","content":"Rich lighting, textures, and stylistic control for brand-safe imagery."}]', 'A go-to tool when you need striking visuals in minutes.', ARRAY['AI','Images','Design'], '3 min', '2024-11-14', 'midjourney')
ON CONFLICT (id) DO NOTHING;

-- Insert Opportunities articles
INSERT INTO posts (id, title, subtitle, category, image_url, author_name, author_bio, author_avatar, content_introduction, content_sections, content_conclusion, tags, read_time, date, slug) VALUES
('opp-1', 'Y Combinator W25 Applications Open', '$500K for startups building bold products', 'Opportunities', 'https://images.unsplash.com/photo-1559136555-930d72f1d30c?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'YC Winter 2025 offers $500K, mentorship, and a global founder network.', '[{"heading":"Why Apply","content":"Access world-class partners, weekly office hours, and a community focused on velocity."}]', 'If you are building something people want, this is the launchpad.', ARRAY['YC','Accelerator','Funding'], '3 min', '2024-12-01', 'yc-w25-applications'),
('opp-2', 'AI Innovation Grant Program', '$100K-$1M for AI with social impact', 'Opportunities', 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800', 'Algo Jua Editorial', 'Curated by the Algo Jua insights desk', 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200', 'The Tech for Good Foundation funds AI projects tackling education, health, and climate.', '[{"heading":"Eligibility","content":"Teams with a working prototype and measurable social outcomes."}]', 'Bring mission-driven AI from pilot to impact with dedicated backing.', ARRAY['AI','Grant','Impact'], '3 min', '2024-11-28', 'ai-innovation-grant')
ON CONFLICT (id) DO NOTHING;

SELECT id, title, category FROM posts ORDER BY date DESC;
