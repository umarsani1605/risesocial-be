// Standalone test: generate a sample certificate with hardcoded data
// Usage: node scripts/test-cert-gen.js
// Output: scripts/output/test-cert.pdf

import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS = path.join(__dirname, '../uploads/certificates');

const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);
const OUTPUT = path.join(__dirname, 'output/test-cert.pdf');

const data = {
  certCode: '001/RISE/IV/2026',
  studentName: 'Umar Sani',
  academyName: 'Rise Academy Environmental, Social, and Governance: Fundamental of ESG',
  issuedDate: 'OCTOBER 4, 2025',
  grades: {
    assignments: 8.5,
    case_study: 8.25,
    final_test: 10.0,
    final_score: 9.0,
  },
};

async function main() {
  const templateBytes = await fs.readFile(path.join(UPLOADS, 'template.pdf'));
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  const corinthiaBold = await pdfDoc.embedFont(await fs.readFile(path.join(UPLOADS, 'fonts/Corinthia/Corinthia-Bold.ttf')));
  const openSans = await pdfDoc.embedFont(await fs.readFile(path.join(UPLOADS, 'fonts/Open_Sans/OpenSans-VariableFont_wdth,wght.ttf')));
  const openSansBold = await pdfDoc.embedFont(await fs.readFile(path.join(UPLOADS, 'fonts/Open_Sans/static/OpenSans-Bold.ttf')));

  const [page1, page2] = pdfDoc.getPages();

  console.log(`Page 1 size: ${page1.getWidth()} x ${page1.getHeight()}`);
  console.log(`Page 2 size: ${page2.getWidth()} x ${page2.getHeight()}`);

  // Page 1
  page1.drawText(data.studentName, {
    x: 230,
    y: 300,
    size: 60,
    font: corinthiaBold,
    color: hex('#405F56'),
  });

  page1.drawText(data.certCode, {
    x: 230,
    y: 420,
    size: 13,
    font: openSansBold,
    color: hex('#405F56'),
  });

  page1.drawText(data.academyName, {
    x: 226,
    y: 216,
    size: 14,
    font: openSansBold,
    color: hex('#405F56'),
  });

  page1.drawText(data.issuedDate, {
    x: 230,
    y: 110,
    size: 13,
    font: openSansBold,
    color: hex('#405F56'),
  });

  // Page 2
  const g = data.grades;
  const gradeColor = rgb(0.1, 0.1, 0.1);
  const gradeSize = 15;

  page2.drawText(data.grades.assignments != null ? Number(data.grades.assignments).toFixed(2) : '-', {
    x: 695,
    y: 325,
    size: gradeSize,
    font: openSansBold,
    color: gradeColor,
  });

  page2.drawText(data.grades.case_study != null ? Number(data.grades.case_study).toFixed(2) : '-', {
    x: 695,
    y: 269,
    size: gradeSize,
    font: openSansBold,
    color: gradeColor,
  });

  page2.drawText(data.grades.final_test != null ? Number(data.grades.final_test).toFixed(2) : '-', {
    x: 695,
    y: 213,
    size: gradeSize,
    font: openSansBold,
    color: gradeColor,
  });

  page2.drawText(data.grades.final_score != null ? Number(data.grades.final_score).toFixed(2) : '-', {
    x: 695,
    y: 154,
    size: gradeSize,
    font: openSansBold,
    color: gradeColor,
  });

  await fs.ensureDir(path.dirname(OUTPUT));
  await fs.writeFile(OUTPUT, await pdfDoc.save());
  console.log(`\nTest certificate saved to: ${OUTPUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
