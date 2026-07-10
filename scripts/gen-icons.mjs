import sharp from "sharp";
import { mkdirSync } from "fs";

mkdirSync("public/icons", { recursive: true });

const svg = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <rect width="100" height="100" fill="#0a0c12"/>
  <text x="50" y="68" font-family="Georgia, serif" font-size="60" font-weight="600" fill="#d4af37" text-anchor="middle">A</text>
</svg>`;

for (const size of [192, 512]) {
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}
console.log("Icons generated.");
