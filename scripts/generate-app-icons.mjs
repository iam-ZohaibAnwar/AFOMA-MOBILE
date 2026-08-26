import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const logoPath = path.join(rootDir, 'src/assets/images/afoma-logo.png');
const iconPath = path.join(rootDir, 'assets/icon.png');
const adaptiveIconPath = path.join(rootDir, 'assets/adaptive-icon.png');
const size = 1024;
const brandBackground = { r: 255, g: 237, b: 213, alpha: 1 };

async function buildIcon(outputPath, background) {
  const logo = await sharp(logoPath)
    .resize(Math.round(size * 0.82), Math.round(size * 0.28), {
      fit: 'inside',
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background,
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(outputPath);
}

await buildIcon(iconPath, brandBackground);
await buildIcon(adaptiveIconPath, brandBackground);

for (const outputPath of [iconPath, adaptiveIconPath]) {
  const metadata = await sharp(outputPath).metadata();
  console.log(`${path.relative(rootDir, outputPath)} -> ${metadata.width}x${metadata.height} ${metadata.format}`);
}
