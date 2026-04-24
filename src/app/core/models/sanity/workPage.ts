import { MediaSource, GfxProjectThumbnail } from './commonSchemas';

export interface PhotoVideoMediaItem {
  media: MediaSource;
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  photoVideoMedia?: PhotoVideoMediaItem[];
  gfxProjects?: GfxProjectThumbnail[];
}
