#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const testFilePath = path.join(__dirname, '../tests/unit/services/testimonialsService.test.js');

console.log('Reading test file...');
let content = fs.readFileSync(testFilePath, 'utf8');

// Count occurrences before replacement
const beforeCount = (content.match(/mockTestimonialsRepository\.(create|update|delete|getStatistics)/g) || []).length;
console.log(`Found ${beforeCount} occurrences of mockTestimonialsRepository.(create|update|delete|getStatistics)`);

// Replace all occurrences in admin test contexts
// We need to be careful to only replace in admin service tests, not user service tests

// Strategy: Replace in sections that test adminTestimonialsService
const lines = content.split('\n');
let inAdminSection = false;
let result = [];

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Detect when we enter admin service test sections
  if (
    line.includes('adminTestimonialsService.createTestimonial') ||
    line.includes('adminTestimonialsService.updateTestimonial') ||
    line.includes('adminTestimonialsService.deleteTestimonial') ||
    line.includes('adminTestimonialsService.getStatistics')
  ) {
    inAdminSection = true;
  }

  // Detect when we exit admin section (new test or describe block)
  if (line.trim().startsWith('it(') || line.trim().startsWith('describe(')) {
    // Check if this is still an admin test
    if (!line.includes('adminTestimonialsService')) {
      inAdminSection = false;
    }
  }

  // Replace in admin sections
  if (inAdminSection) {
    line = line.replace(/mockTestimonialsRepository\.create/g, 'mockAdminTestimonialsRepository.create');
    line = line.replace(/mockTestimonialsRepository\.update/g, 'mockAdminTestimonialsRepository.update');
    line = line.replace(/mockTestimonialsRepository\.delete/g, 'mockAdminTestimonialsRepository.delete');
    line = line.replace(/mockTestimonialsRepository\.getStatistics/g, 'mockAdminTestimonialsRepository.getStatistics');
  }

  result.push(line);
}

content = result.join('\n');

// Count occurrences after replacement
const afterCount = (content.match(/mockTestimonialsRepository\.(create|update|delete|getStatistics)/g) || []).length;
console.log(`After replacement: ${afterCount} occurrences remaining`);
console.log(`Replaced ${beforeCount - afterCount} occurrences`);

console.log('Writing updated test file...');
fs.writeFileSync(testFilePath, content, 'utf8');

console.log('Done!');
