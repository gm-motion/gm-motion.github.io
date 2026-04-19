import { Injectable } from '@angular/core';
import Player from '@vimeo/player';
import { VideoProvider } from '../models/video.types';

@Injectable({
  providedIn: 'root',
})
export class VideoPlayerService {
  private vimeoPlayers = new Map<HTMLIFrameElement, Player>();

  buildEmbedUrl(url: string, provider: VideoProvider): string {
    if (!url) return '';

    switch (provider) {
      case 'vimeo':
        return this.buildVimeoEmbed(url);

      case 'youtube':
        return this.buildYouTubeEmbed(url);

      default:
        return '';
    }
  }

  private buildVimeoEmbed(url: string): string {
    const match = url.match(
      /vimeo\.com\/(?:video\/)?(\d+)(?:\?h=([a-zA-Z0-9]+))?/,
    );

    if (!match) return '';

    const id = match[1];
    const hash = match[2];

    const params = new URLSearchParams();

    if (hash) params.set('h', hash);

    params.set('background', '1');
    params.set('autoplay', '1');
    params.set('loop', '1');
    params.set('muted', '1');
    params.set('autopause', '0');
    params.set('playsinline', '1');

    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  private buildYouTubeEmbed(url: string): string {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    );

    if (!match) return '';

    const id = match[1];

    const params = new URLSearchParams();
    params.set('autoplay', '1');
    params.set('mute', '1');
    params.set('loop', '1');
    params.set('playlist', id);
    params.set('playsinline', '1');
    params.set('controls', '0');

    params.set('modestbranding', '1'); // reduces logo (but does NOT remove it)
    params.set('rel', '0'); // no unrelated videos
    params.set('iv_load_policy', '3'); // hide annotations
    params.set('disablekb', '1'); // disables keyboard UI
    params.set('fs', '0'); // hides fullscreen button
    params.set('showinfo', '0'); // deprecated but harmless

    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }

  initVimeoPlayer(iframe: HTMLIFrameElement): Player {
    let player = this.vimeoPlayers.get(iframe);

    if (!player) {
      player = new Player(iframe);
      this.vimeoPlayers.set(iframe, player);
    }

    return player;
  }

  restartIframe(iframe: HTMLIFrameElement): void {
    const src = iframe.src;
    iframe.src = '';

    requestAnimationFrame(() => {
      iframe.src = src;
    });
  }

  async retryVideo(
    iframe: HTMLIFrameElement,
    provider: VideoProvider,
  ): Promise<void> {
    if (provider === 'vimeo') {
      await this.retryVimeo(iframe);
      return;
    }

    this.retryYouTube(iframe);
  }

  async retryAllVideos(
    videos: { iframe: HTMLIFrameElement; provider: VideoProvider }[],
    delayMs = 0,
  ): Promise<void> {
    if (!videos.length) return;
    window.setTimeout(async () => {
      for (const video of videos) {
        await this.retryVideo(video.iframe, video.provider);
      }
    }, delayMs);
  }

  private async retryVimeo(iframe: HTMLIFrameElement): Promise<void> {
    try {
      const player = this.initVimeoPlayer(iframe);
      await player.ready();

      const paused = await player.getPaused().catch(() => true);

      if (paused) {
        await player.play();
      }
    } catch {
      this.restartIframe(iframe);
    }
  }

  private retryYouTube(iframe: HTMLIFrameElement): void {
    this.restartIframe(iframe);
  }

  restartAnimation(el: HTMLElement): void {
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
  }
}
