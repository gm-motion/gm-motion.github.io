import { SanityImage, Paragraph, VideoSource, GfxProjectThumbnail } from './commonSchemas';

export interface PartneredClientItem {
  client: string;
  img?: SanityImage;
}

export interface HomeData {
  titleVideo?: VideoSource;
  headQuote?: string;
  headParagraphs?: Paragraph[];
  videoStack?: VideoSource[];
  gfxProjects?: GfxProjectThumbnail[];
  partneredClientsSection?: PartneredClientItem[];
}