export type TopicSlug = string;

export interface TopicNode {
  slug: TopicSlug;
  name: string;
  prereqs: TopicSlug[];
}

export interface MasteryEntry {
  attempts: number;
  correct: number;
  score: number; // 0..1
  level: 1 | 2 | 3; // difficulty level
}

export type MasteryState = Record<TopicSlug, MasteryEntry>;

const STORAGE_KEY = 'studymate_mastery_state_v1';

export const TOPICS: TopicNode[] = [
  // Number Systems
  { slug: 'real-numbers', name: 'Real Numbers', prereqs: [] },
  { slug: 'rational-irrational-numbers', name: 'Rational & Irrational Numbers', prereqs: ['real-numbers'] },
  { slug: 'number-properties', name: 'Number Properties', prereqs: ['real-numbers'] },

  // Algebra
  { slug: 'linear-equations-one-variable', name: 'Linear Equations (One Variable)', prereqs: ['real-numbers'] },
  { slug: 'linear-equations-two-variables', name: 'Linear Equations (Two Variables)', prereqs: ['linear-equations-one-variable'] },
  { slug: 'quadratic-equations', name: 'Quadratic Equations', prereqs: ['polynomials'] },
  { slug: 'polynomials', name: 'Polynomials', prereqs: ['real-numbers'] },

  // Geometry
  { slug: 'basic-geometry', name: 'Basic Geometry', prereqs: ['real-numbers'] },
  { slug: 'triangles-congruence', name: 'Triangles & Congruence', prereqs: ['basic-geometry'] },
  { slug: 'coordinate-geometry', name: 'Coordinate Geometry', prereqs: ['real-numbers'] },
  { slug: 'circles', name: 'Circles', prereqs: ['basic-geometry'] },
  { slug: 'surface-areas-and-volumes', name: 'Surface Areas & Volumes', prereqs: ['basic-geometry', 'circles', 'triangles-congruence'] },

  // Statistics & Probability
  { slug: 'data-handling', name: 'Data Handling', prereqs: [] },
  { slug: 'mean-median-mode', name: 'Mean, Median, Mode', prereqs: ['data-handling'] },
  { slug: 'probability-theory', name: 'Probability Theory', prereqs: ['data-handling'] },
  { slug: 'statistical-graphs', name: 'Statistical Graphs', prereqs: ['data-handling'] },

  // Trigonometry
  { slug: 'basic-ratios', name: 'Basic Ratios', prereqs: ['triangles-congruence'] },
  { slug: 'trigonometric-identities', name: 'Trigonometric Identities', prereqs: ['basic-ratios'] },
  { slug: 'heights-and-distances', name: 'Heights & Distances', prereqs: ['basic-ratios'] },
  { slug: 'applications', name: 'Applications', prereqs: ['basic-ratios'] },
];

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function getInitialEntry(): MasteryEntry {
  return { attempts: 0, correct: 0, score: 0, level: 1 };
}

export function getState(): MasteryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MasteryState;
  } catch {}
  // default state with all topics initialized
  const state: MasteryState = {};
  for (const t of TOPICS) state[t.slug] = getInitialEntry();
  return state;
}

export function saveState(state: MasteryState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function updateMastery(slug: TopicSlug, wasCorrect: boolean): MasteryState {
  const state = getState();
  const entry = state[slug] ?? getInitialEntry();
  entry.attempts += 1;
  if (wasCorrect) entry.correct += 1;
  entry.score = entry.attempts > 0 ? entry.correct / entry.attempts : 0;
  // adapt difficulty: if score > 0.8 increase, if < 0.4 decrease
  if (entry.score > 0.8 && entry.level < 3) entry.level = (entry.level + 1) as 1|2|3;
  if (entry.score < 0.4 && entry.level > 1) entry.level = (entry.level - 1) as 1|2|3;
  state[slug] = entry;
  saveState(state);
  return state;
}

export function getEntry(slug: TopicSlug): MasteryEntry {
  const state = getState();
  return state[slug] ?? getInitialEntry();
}

export function unmetPrereqs(slug: TopicSlug): TopicSlug[] {
  const state = getState();
  const node = TOPICS.find(t => t.slug === slug);
  if (!node) return [];
  return node.prereqs.filter(p => (state[p]?.score ?? 0) < 0.6);
}

export function recommendedNextTopics(): TopicNode[] {
  const state = getState();
  // recommend topics with low mastery but prereqs met
  const ready = TOPICS.filter(t => unmetPrereqs(t.slug).length === 0);
  const sorted = [...ready].sort((a,b) => (state[a.slug]?.score ?? 0) - (state[b.slug]?.score ?? 0));
  return sorted.slice(0, 3);
}
