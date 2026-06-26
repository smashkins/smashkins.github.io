export type ProjectContext = 'employed' | 'freelance' | 'indie';

export interface TextLink {
  label: string;
  href: string;
}

export interface ResumeJob {
  role: string;
  period: string;
  org: string;
  note?: string;
  notes?: string[];
}

export interface ResumeMetaRow {
  label: string;
  value: string;
  note?: string;
  led?: boolean;
}

export interface ResumeSkillGroup {
  category: string;
  items?: string[];
}

export interface ResumeData {
  name: string;
  role: string;
  summary: string;
  jobs?: ResumeJob[];
  meta?: ResumeMetaRow[];
  skills?: ResumeSkillGroup[];
  metaAfter?: ResumeMetaRow[];
  portfolio?: TextLink[];
}

export interface PortfolioSpec {
  label: string;
  value: string;
}

export type PortfolioVideo = string | { src: string; poster?: string };

export interface PortfolioProject {
  slug: string;
  context: ProjectContext;
  experimental?: boolean;
  platform: string;
  title: string;
  date?: string;
  client?: string;
  summary: string;
  description?: string;
  specs?: PortfolioSpec[];
  images?: string[];
  videos?: PortfolioVideo[];
  links?: TextLink[];
}

export interface PortfolioData {
  eyebrow?: string;
  title?: string;
  intro?: string;
  projects?: PortfolioProject[];
}

export interface IdentityData {
  eyebrow?: string;
  title: string;
  badge?: string;
  paragraphs?: string[];
  specs?: PortfolioSpec[];
}

export interface NoteSegment {
  text: string;
  project?: string;
}

export const PF_PAGE_SIZE = 6;
export const PF_CONTEXT_ORDER = ['employed', 'freelance', 'indie'] as const;
export const PF_CONTEXT_LABELS: Record<ProjectContext, string> = {
  employed: 'Employed',
  freelance: 'Freelance',
  indie: 'Indie',
};

export function hasItems<T>(items: T[] | undefined): items is T[] {
  return Array.isArray(items) && items.length > 0;
}

// Syntax in resume.md: [Eolo](project:eolo) links the text to a portfolio item.
export function parseNote(text: string): NoteSegment[] {
  const segments: NoteSegment[] = [];
  const re = /\[([^\]]+)\]\(project:([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) });
    segments.push({ text: match[1], project: match[2] });
    last = match.index + match[0].length;
  }

  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

export function getPortfolioFilters(projects: PortfolioProject[]) {
  const contexts = PF_CONTEXT_ORDER.filter((context) =>
    projects.some((project) => project.context === context)
  );
  const hasExperimental = projects.some((project) => project.experimental);

  return {
    contexts,
    hasExperimental,
    hasFilters: contexts.length > 1 || hasExperimental,
  };
}
