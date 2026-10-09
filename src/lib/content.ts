// Helpers for querying content collections. Pages use these so that ordering,
// URLs and draft filtering are decided in one place.

import { getCollection, type CollectionEntry } from 'astro:content';

export type Subject = CollectionEntry<'subjects'>;
export type Course = CollectionEntry<'courses'>;
export type Person = CollectionEntry<'people'>;
export type Vacancy = CollectionEntry<'vacancies'>;
export type Post = CollectionEntry<'journal'>;
export type ModuleDescription = CollectionEntry<'moduleDescriptions'>;
export type Programme = CollectionEntry<'programmes'>;

const byOrder = (a: { data: { order: number } }, b: { data: { order: number } }) => a.data.order - b.data.order;

export async function getSubjects(): Promise<Subject[]> {
  return (await getCollection('subjects')).sort(byOrder);
}

export async function getCourses(): Promise<Course[]> {
  const [subjects, courses] = await Promise.all([getSubjects(), getCollection('courses')]);
  const subjectRank = new Map(subjects.map((s, i) => [s.id, i]));
  return courses.sort(
    (a, b) => (subjectRank.get(a.data.subject.id) ?? 0) - (subjectRank.get(b.data.subject.id) ?? 0) || byOrder(a, b),
  );
}

export async function getPeople(): Promise<Person[]> {
  return (await getCollection('people')).sort(byOrder);
}

/** Open vacancies, standing "any area" applications last. */
export async function getOpenVacancies(): Promise<Vacancy[]> {
  return (await getCollection('vacancies', ({ data }) => data.status === 'open')).sort(
    (a, b) =>
      Number(a.data.area === 'any') - Number(b.data.area === 'any') || b.data.posted.valueOf() - a.data.posted.valueOf(),
  );
}

/** Published posts, newest first. Drafts are visible in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('journal', ({ data }) => import.meta.env.DEV || !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export async function getProgrammes(): Promise<Programme[]> {
  return (await getCollection('programmes')).sort(byOrder);
}

/** The LaTeX module description for a course (matched on its code), if one exists. */
export async function getModuleDescription(course: Course): Promise<ModuleDescription | undefined> {
  const descriptions = await getCollection('moduleDescriptions');
  const matches = descriptions.filter((d) => d.data.code === course.data.code);
  if (matches.length > 1) {
    throw new Error(
      `Several module descriptions have \\ModuleCode{${course.data.code}}: ${matches.map((m) => m.filePath).join(', ')}`,
    );
  }
  return matches[0];
}

/** Where a course sits in a programme plan, e.g. Foundation programme · Semester 1. */
export async function getPlacement(course: Course): Promise<{ programme: Programme; semester: string } | undefined> {
  for (const programme of await getProgrammes()) {
    for (const semester of programme.data.semesters) {
      if (semester.modules.some((m) => m.course?.id === course.id)) return { programme, semester: semester.title };
    }
  }
  return undefined;
}

export const courseUrl = (course: Course) => `/courses/${course.data.subject.id}/${course.id}/`;
export const subjectUrl = (subject: Subject | string) =>
  `/courses/${typeof subject === 'string' ? subject : subject.id}/`;
export const personUrl = (person: Person | string) => `/about/#${typeof person === 'string' ? person : person.id}`;
export const postUrl = (post: Post) => `/journal/${post.id}/`;
export const programmeUrl = (programme: Programme | string) =>
  `/programme/#${typeof programme === 'string' ? programme : programme.id}`;

/**
 * Suggested learning path: courses ordered so that every prerequisite (and,
 * where possible, every recommended course) comes before the courses that
 * build on it. Ties keep catalogue order.
 */
export function learningPath(courses: Course[]): Course[] {
  const ids = new Set(courses.map((c) => c.id));
  const before = new Map<string, Set<string>>();
  for (const course of courses) {
    const deps = [...(course.data.prerequisites ?? []), ...course.data.recommended]
      .map((ref) => ref.id)
      .filter((id) => ids.has(id) && id !== course.id);
    before.set(course.id, new Set(deps));
  }

  const path: Course[] = [];
  const placed = new Set<string>();
  const remaining = [...courses];
  while (remaining.length) {
    // Prefer a course whose dependencies are all placed; break cycles by
    // falling back to catalogue order.
    const index = Math.max(
      0,
      remaining.findIndex((c) => [...(before.get(c.id) ?? [])].every((id) => placed.has(id))),
    );
    const [next] = remaining.splice(index, 1);
    path.push(next);
    placed.add(next.id);
  }
  return path;
}
