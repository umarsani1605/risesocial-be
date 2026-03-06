#!/usr/bin/env python3

import re

# Read the file
with open('backend/tests/unit/services/testimonialsService.test.js', 'r') as f:
    content = f.read()

# Split into lines for context-aware replacement
lines = content.split('\n')
result = []
in_admin_test = False

for i, line in enumerate(lines):
    # Check if we're in an admin test context
    if 'adminTestimonialsService.' in line and ('createTestimonial' in line or 'updateTestimonial' in line or 'deleteTestimonial' in line or 'getStatistics' in line):
        in_admin_test = True
    
    # Check if we're leaving the test (closing brace at test level)
    if line.strip() == '});' and in_admin_test:
        # Look ahead to see if next non-empty line is a new test
        for j in range(i+1, min(i+5, len(lines))):
            if lines[j].strip() and not lines[j].strip().startswith('//'):
                if lines[j].strip().startswith('it(') or lines[j].strip().startswith('describe('):
                    in_admin_test = False
                break
    
    # Replace in admin test context
    if in_admin_test:
        line = line.replace('mockTestimonialsRepository.create', 'mockAdminTestimonialsRepository.create')
        line = line.replace('mockTestimonialsRepository.update', 'mockAdminTestimonialsRepository.update')
        line = line.replace('mockTestimonialsRepository.delete', 'mockAdminTestimonialsRepository.delete')
        line = line.replace('mockTestimonialsRepository.getStatistics', 'mockAdminTestimonialsRepository.getStatistics')
    
    result.append(line)

# Write back
with open('backend/tests/unit/services/testimonialsService.test.js', 'w') as f:
    f.write('\n'.join(result))

print("Fixed test mocks!")
