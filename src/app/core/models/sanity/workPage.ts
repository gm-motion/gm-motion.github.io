import { VideoItem, MediaSource } from './commonSchemas';

export interface PhotoVideoMediaItem {
  media: MediaSource;
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  gfxWorkMedia?: VideoItem[];
  photoVideoMedia?: PhotoVideoMediaItem[];
}
