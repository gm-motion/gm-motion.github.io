import { SanityImage, Paragraph, VideoSource, VideoItem } from './commonSchemas';

export interface PartneredClientItem {
  client: string;
  img?: SanityImage;
}

export interface HomeData {
  titleVideo?: VideoSource;
  headQuote?: string;
  headParagraphs: Paragraph[];
  videoStack?: VideoSource[];
  gfxWorkSection?: VideoItem[];
  partneredClientsSection?: PartneredClientItem[];
}