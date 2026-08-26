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
const transparentBackground = { r: 0, g: 0, b: 0, alpha: 0 };

/**
 * iOS / store icon — logo can use more of the square canvas.
 */
const IOS_LOGO_WIDTH_RATIO = 0.82;
const IOS_LOGO_HEIGHT_RATIO = 0.28;

/**
 * Android adaptive foreground — only the center ~66% circle is safe.
 * Keep the wordmark narrower so launcher circles do not clip the "a"s.
 */
const ANDROID_LOGO_WIDTH_RATIO = 0.56;
const ANDROID_LOGO_HEIGHT_RATIO = 0.14;

async function buildIcon(outputPath, { background, widthRatio, heightRatio }) {
  const logo = await sharp(logoPath)
    .resize(Math.round(size * widthRatio), Math.round(size * heightRatio), {
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

if (!fs.existsSync(logoPath)) {
  throw new Error(`Logo not found: ${logoPath}`);
}

await buildIcon(iconPath, {
  background: brandBackground,
  widthRatio: IOS_LOGO_WIDTH_RATIO,
  heightRatio: IOS_LOGO_HEIGHT_RATIO,
});

await buildIcon(adaptiveIconPath, {
  background: transparentBackground,
  widthRatio: ANDROID_LOGO_WIDTH_RATIO,
  heightRatio: ANDROID_LOGO_HEIGHT_RATIO,
});

for (const outputPath of [iconPath, adaptiveIconPath]) {
  const metadata = await sharp(outputPath).metadata();
  console.log(`${path.relative(rootDir, outputPath)} -> ${metadata.width}x${metadata.height} ${metadata.format}`);
}
