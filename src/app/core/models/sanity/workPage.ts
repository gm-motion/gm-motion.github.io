import { GfxWorkItem, MediaSource } from './commonSchemas';

export interface PhotoVideoMediaItem {
  media: MediaSource;
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  gfxWorkMedia?: GfxWorkItem[];
  photoVideoMedia?: PhotoVideoMediaItem[];
}
