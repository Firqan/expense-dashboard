export const CATEGORY_COLORS = [
  '#0d9488',
  '#d97706',
  '#7c3aed',
  '#db2777',
  '#2563eb',
  '#65a30d',
  '#ea580c',
  '#0891b2',
];

export function colorForIndex(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}
