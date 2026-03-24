#!/usr/bin/env node

/**
 * Script to update all academy-related references after schema refactor
 * - path_slug → slug
 * - Remove rating, rating_count, meta_title, meta_description references
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesToUpdate = [
  'src/services/shared/academyService.js',
  'src/services/shared/instructorService.js',
  'src/services/user/enrollmentService.js',
  'src/repositories/shared/instructorRepository.js',
  'src/repositories/user/enrollmentRepository.js',
  'src/schemas/shared/academySchemas.js',
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Replace path_slug with slug
  if (content.includes('path_slug')) {
    content = content.replace(/path_slug/g, 'slug');
    updated = true;
    console.log(`✅ Updated path_slug → slug in ${filePath}`);
  }

  // Remove rating references (but keep rating_display for formatting)
  const ratingPatterns = [
    /rating:\s*\{\s*gte:\s*Number\(minRating\)\s*\}/g,
    /rating:\s*0,?\s*\n/g,
    /rating_count:\s*0,?\s*\n/g,
    /meta_title:.*?\n/g,
    /meta_description:.*?\n/g,
  ];

  ratingPatterns.forEach((pattern) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      updated = true;
    }
  });

  if (updated) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Updated ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for ${filePath}`);
  }
}

console.log('🚀 Starting academy references update...\n');

filesToUpdate.forEach(updateFile);

console.log('\n✅ Academy references update completed!');
