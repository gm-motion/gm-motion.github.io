export interface SanityImageAsset {
  url?: string;
}

export interface SanityImage {
  asset?: SanityImageAsset;
  alt?: string;
}

export interface Paragraph {
  text: string;
}

export interface VideoItem {
  video: VideoSource;
  route: string;
}

export interface GfxProjectThumbnail {
  title: string;
  route: string;
  thumbnail: VideoSource;
}

export interface MediaSource {
  mediaType: 'video' | 'image';
  alt?: string;
  video?: VideoSource;
  image?: MediaImage;
}

export interface MediaImage {
  asset?: {
    url?: string;
  };
}

export interface VideoSource {
  sourceType: 'external' | 'upload';
  provider?: 'vimeo' | 'youtube' | 'direct';
  url?: string;
  name: string;
  description?: string;
  videoFile?: {
    asset?: {
      url: string;
    };
  };
}