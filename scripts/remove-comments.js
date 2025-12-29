import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function removeComments(content) {
  let result = content;

  result = result.replace(/\/\*\*[\s\S]*?\*\//g, '');

  result = result.replace(/\/\*[\s\S]*?\*\//g, '');

  result = result
    .split('\n')
    .map((line) => {
      return line.replace(/\/\/.*$/, '');
    })
    .join('\n');

  result = result.replace(/\n\s*\n\s*\n/g, '\n\n');

  return result;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cleaned = removeComments(content);
    fs.writeFileSync(filePath, cleaned, 'utf8');
    console.log(`✓ Processed: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findJsFiles(dir) {
  const files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

const targetDirs = process.argv.slice(2);

if (targetDirs.length === 0) {
  console.error('Usage: node remove-comments.js <directory1> [directory2] ...');
  process.exit(1);
}

let totalProcessed = 0;
let totalSuccess = 0;

for (const dir of targetDirs) {
  const fullPath = path.resolve(dir);

  if (!fs.existsSync(fullPath)) {
    console.error(`Directory not found: ${fullPath}`);
    continue;
  }

  console.log(`\nProcessing directory: ${fullPath}`);
  const files = findJsFiles(fullPath);
  console.log(`Found ${files.length} JavaScript files\n`);

  for (const file of files) {
    totalProcessed++;
    if (processFile(file)) {
      totalSuccess++;
    }
  }
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Total files processed: ${totalProcessed}`);
console.log(`Successful: ${totalSuccess}`);
console.log(`Failed: ${totalProcessed - totalSuccess}`);
console.log(`${'='.repeat(50)}`);
