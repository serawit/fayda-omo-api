import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const publicDir = join(__dirname, "../public");
const sourceImage = join(publicDir, "omo-bank-logo.webp");

const sizes = [192, 512];

async function generateIcons() {
  console.log(`Processing: ${sourceImage}`);

  for (const size of sizes) {
    const outputPath = join(publicDir, `pwa-${size}x${size}.png`);
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 0 },
        })
        .toFile(outputPath);
      console.log(`✅ Generated: pwa-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size}:`, error);
    }
  }
}

generateIcons();
