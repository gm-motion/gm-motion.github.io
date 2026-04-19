export type VideoProvider = 'vimeo' | 'youtube';

export interface VideoSource {
  provider: VideoProvider;
  id: string;
  hash?: string; // Vimeo only
}
