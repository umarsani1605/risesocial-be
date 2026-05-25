import { describe, expect, it } from 'vitest';
import { flattenAcademySyllabusToModules } from '../../../src/utils/academySyllabus.js';

describe('flattenAcademySyllabusToModules', () => {
  it('uses top-level topics when there are no subtopics', () => {
    const modules = flattenAcademySyllabusToModules([
      { id: 1, order: 1, title: 'Topic A', description: 'Desc A', topics: [] },
      { id: 2, order: 2, title: 'Topic B', description: 'Desc B', topics: [] },
    ]);

    expect(modules).toEqual([
      { title: 'Topic A', description: 'Desc A', order: 1 },
      { title: 'Topic B', description: 'Desc B', order: 2 },
    ]);
  });

  it('flattens mixed syllabus per top-level topic, using subtopics when present', () => {
    const modules = flattenAcademySyllabusToModules([
      { id: 1, order: 1, title: 'Topic Only', description: 'Standalone', topics: [] },
      {
        id: 2,
        order: 2,
        title: 'Topic With Subtopics',
        description: 'Parent',
        topics: [
          { id: 21, order: 1, title: 'Subtopic 1', description: 'One' },
          { id: 22, order: 2, title: 'Subtopic 2', description: 'Two' },
        ],
      },
    ]);

    expect(modules).toEqual([
      { title: 'Topic Only', description: 'Standalone', order: 1 },
      { title: 'Subtopic 1', description: 'One', order: 2 },
      { title: 'Subtopic 2', description: 'Two', order: 3 },
    ]);
  });
});
