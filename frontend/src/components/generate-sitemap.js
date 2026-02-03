import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const domain = "https://fayda.omobanksc.com"; // Replace with your actual domain

const routes = [
  "/",
  "/login",
  "/register",
  "/forgot-account",
  "/help",
  "/privacy",
  "/terms",
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes
    .map((route) => {
      return `<url><loc>${domain}${route}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`;
    })
    .join("")}
</urlset>`;

fs.writeFileSync(path.join(__dirname, "public", "sitemap.xml"), sitemap);
console.log("✅ Sitemap generated successfully!");
