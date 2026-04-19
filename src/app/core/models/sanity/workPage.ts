import { MediaSource } from './commonSchemas';

export interface GfxWorkItem {
  route: string;
  media: MediaSource;
}

export interface PhotoVideoMediaItem {
  name: string;
  img: {
    asset?: {
      url: string;
    };
    alt?: string;
  };
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  gfxWorkMedia?: GfxWorkItem[];
  photoVideoMedia?: PhotoVideoMediaItem[];
}
