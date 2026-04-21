import { VideoSource, MediaSource } from './commonSchemas';

export interface GfxProjectSection {
  subheader?: string;
  paragraph?: string;
  media?: MediaSource;
}

export interface GfxProject {
  title: string;
  subheader: string;
  slug: string;
  thumbnail?: VideoSource;
  sections?: GfxProjectSection[];
}
