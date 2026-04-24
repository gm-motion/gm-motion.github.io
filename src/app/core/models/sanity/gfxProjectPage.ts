import { VideoSource, MediaSource, SanityImage } from './commonSchemas';

export interface GfxProjectSection {
  subheader?: string;

  banner?: SanityImage;

  paragraphs?: string[];

  columns?: number;
  mediaHeader: string;

  mediaItems?: MediaSource[];
}

export interface GfxProject {
  title: string;
  subheader: string;
  slug: string;

  thumbnail?: VideoSource;

  sections?: GfxProjectSection[];
}
