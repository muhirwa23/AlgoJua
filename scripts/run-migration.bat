@echo off
set VITE_DATABASE_URL=postgresql://neondb_owner:npg_Ha0FlrjhGsP1@ep-sparkling-pond-a96azzph-pooler.gwc.azure.neon.tech/neondb?sslmode=require
node scripts/add-seo-fields.js
