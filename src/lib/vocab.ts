// Allowed values for course fields, shared by the content schema and the UI.

export const courseLevels = ['introductory', 'intermediate', 'advanced'] as const;
export const courseStatuses = ['open', 'upcoming', 'archived'] as const;
export const courseFormats = ['self-paced', 'cohort'] as const;

export type CourseLevel = (typeof courseLevels)[number];
export type CourseStatus = (typeof courseStatuses)[number];
export type CourseFormat = (typeof courseFormats)[number];
