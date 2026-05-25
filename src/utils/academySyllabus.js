export function flattenAcademySyllabusToModules(themes = []) {
  const flattened = [];

  for (const theme of themes) {
    const topics = Array.isArray(theme.topics) ? theme.topics : [];

    if (topics.length === 0) {
      flattened.push({
        title: theme.title,
        description: theme.description ?? '',
      });
      continue;
    }

    for (const topic of topics) {
      flattened.push({
        title: topic.title,
        description: topic.description ?? '',
      });
    }
  }

  return flattened.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
}
