const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function monthToRoman(n) {
  return ROMAN[n - 1];
}

export function formatCertificateCode(id, date) {
  const seq = String(id).padStart(3, '0');
  const roman = monthToRoman(date.getMonth() + 1);
  const year = date.getFullYear();
  return `${seq}/RISE/${roman}/${year}`;
}

export function safeFilename(code) {
  return code.replace(/\//g, '-') + '.pdf';
}

export function formatIssuedDate(date) {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
}
