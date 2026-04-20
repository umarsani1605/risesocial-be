// One-time dev helper: overlay a coordinate grid on example.pdf so you can
// visually identify where each text field sits, then report coords to hardcode
// into _generatePDF().
//
// Usage: node scripts/find-cert-coordinates.js
// Output: scripts/output/cert-grid.pdf

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT = path.join(__dirname, '../uploads/certificates/example.pdf');
const OUTPUT = path.join(__dirname, 'output/cert-grid.pdf');

const GRID_STEP = 25;
const MAJOR_STEP = 100;

async function main() {
  const bytes = await fs.readFile(INPUT);
  const pdfDoc = await PDFDocument.load(bytes);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  for (const page of pdfDoc.getPages()) {
    const { width, height } = page.getSize();

    // Draw vertical lines
    for (let x = 0; x <= width; x += GRID_STEP) {
      const isMajor = x % MAJOR_STEP === 0;
      page.drawLine({
        start: { x, y: 0 },
        end: { x, y: height },
        thickness: isMajor ? 0.4 : 0.15,
        color: rgb(0.6, 0.6, 1),
        opacity: isMajor ? 0.6 : 0.3,
      });
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += GRID_STEP) {
      const isMajor = y % MAJOR_STEP === 0;
      page.drawLine({
        start: { x: 0, y },
        end: { x: width, y },
        thickness: isMajor ? 0.4 : 0.15,
        color: rgb(1, 0.5, 0.5),
        opacity: isMajor ? 0.6 : 0.3,
      });
    }

    // Label major intersections
    for (let x = 0; x <= width; x += MAJOR_STEP) {
      for (let y = 0; y <= height; y += MAJOR_STEP) {
        page.drawText(`${x},${y}`, {
          x: x + 1,
          y: y + 1,
          size: 5,
          font: helvetica,
          color: rgb(0.2, 0.2, 0.8),
          opacity: 0.7,
        });
      }
    }
  }

  await fs.ensureDir(path.dirname(OUTPUT));
  await fs.writeFile(OUTPUT, await pdfDoc.save());
  console.log(`Grid PDF saved to: ${OUTPUT}`);
  console.log('Open it and note the (x,y) coordinates of each text field.');
  console.log('Note: pdf-lib origin is bottom-left (y=0 at bottom).');
}

main().catch((err) => { console.error(err); process.exit(1); });
