import { SanityImage, VideoItem } from './commonSchemas';

export interface PhotoMediaItem {
  img: SanityImage;
  name: string;
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  gfxWorkMedia?: VideoItem[];
  photoVideoMedia?: PhotoMediaItem[];
}
