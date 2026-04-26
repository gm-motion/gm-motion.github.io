import {Paragraph, SanityImage} from './commonSchemas';

export interface TimelineMilestone {
  date: string;
  title: string;
  description: string;
  route: string;
}

export interface Mentor {
  headshot?: SanityImage;
  name: string;
  company?: string;
  title?: string;
  description?: string;
}

export interface TimelineItem {
  company: string;
  title: string;
  date: string;
  logo?: SanityImage;
  milestones: TimelineMilestone[];
}

export interface AboutData {
  headshot?: SanityImage | null;
  aboutInfoParagraphs?: Paragraph[];
  timelineItems?: TimelineItem[];
  aspirationParagraphs?: Paragraph[];
  mentors?: Mentor[];
}