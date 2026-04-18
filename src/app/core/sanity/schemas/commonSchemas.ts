export interface SanityImageAsset {
  url?: string
}

export interface SanityImage {
  asset?: SanityImageAsset
  alt?: string
}

export interface Paragraph {
  text: string;
}

export interface VideoItem {
  video: VideoSource;
  route: string;
}

export interface VideoSource {
  sourceType: 'external'|'upload';
  provider?: 'vimeo'|'youtube'|'direct';
  url?: string;
  videoFile?: {asset?: {url: string;};};
  name: string;
  description?: string;
}