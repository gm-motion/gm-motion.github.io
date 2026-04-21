import { VideoSource, MediaSource } from './commonSchemas';

export interface PhotoVideoMediaItem {
  media: MediaSource;
}

export interface GfxProjectThumbnail {
  title: string;
  route: string;
  thumbnail: VideoSource;
}

export interface WorkData {
  gfxSubHeader?: string;
  photoVideoParagraph?: string;
  photoVideoMedia?: PhotoVideoMediaItem[];
  gfxProjects?: GfxProjectThumbnail[];
}
