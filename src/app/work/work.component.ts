import {
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FadeInDirective } from '../core/directives/fade-in.directive';
import { HeaderAnimationDirective } from '../core/directives/header-animation.directive';
import { SanityContentService } from '../core/sanity/sanity-content.service';
import { VideoItem, VideoSource } from '../core/models/sanity/commonSchemas';
import { PhotoVideoMediaItem, GfxWorkItem } from '../core/models/sanity/workPage';
import { VideoPlayerService } from '../core/services/video-player.service';
import { VideoProvider } from '../core/models/video.types';

interface MediaImage {
  asset?: {
    url?: string;
  };
}

interface MediaSource {
  mediaType: 'video' | 'image';
  alt?: string;
  video?: VideoSource;
  image?: MediaImage;
}

interface GfxCard {
  route: string;
  media: MediaSource;
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-work',
  imports: [RouterLink, FadeInDirective, HeaderAnimationDirective],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent implements OnInit, AfterViewInit {
  @ViewChildren('videoFrame') videoFrames!: QueryList<
    ElementRef<HTMLIFrameElement>
  >;

  private videos: { iframe: HTMLIFrameElement; provider: VideoProvider }[] = [];

  gfxSubHeader = '';
  photoVideoParagraph = '';

  gfxWorkMedia: GfxWorkItem[] = [];
  photoVideoMedia: PhotoVideoMediaItem[] = [];

  isGfxLoading = true;

  gfxWorkRows: GfxCard[][] = Array.from({ length: 2 }, () =>
    Array.from({ length: 3 }, () => ({
      route: '/',
      safeUrl: undefined,
      uploadUrl: '',
      imageUrl: '',
      media: {
        mediaType: 'video',
        video: {
          name: '',
          sourceType: 'upload',
          uploadUrl: '',
          safeUrl: '',
          description: '',
        },
      },
    })),
  );

  constructor(
    private sanitizer: DomSanitizer,
    private sanityContentService: SanityContentService,
    private cdr: ChangeDetectorRef,
    private videoPlayer: VideoPlayerService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const workPageData = await this.sanityContentService.getWorkPage();

      if (workPageData?.gfxSubHeader) {
        this.gfxSubHeader = workPageData.gfxSubHeader;
      }

      if (workPageData?.photoVideoParagraph) {
        this.photoVideoParagraph = workPageData.photoVideoParagraph;
      }

      if (workPageData?.gfxWorkMedia?.length) {
        this.gfxWorkMedia = [...workPageData.gfxWorkMedia];
        this.gfxWorkRows = this.buildGfxRows(this.gfxWorkMedia);
        this.isGfxLoading = false;
      } else {
        this.gfxWorkRows = [];
        this.isGfxLoading = false;
      }

      if (workPageData?.photoVideoMedia?.length) {
        this.photoVideoMedia = [...workPageData.photoVideoMedia];
      }

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load Work Page Schema from Sanity:', error);
      this.isGfxLoading = false;
      this.cdr.markForCheck();
    }
  }

  ngAfterViewInit(): void {
    const frames = this.videoFrames.toArray();
    if (!frames.length) return;

    const flatCards = this.gfxWorkRows.flat();

    this.videos = frames
      .map((frameRef, i) => {
        const card = flatCards[i];
        const provider =
          card?.media?.mediaType === 'video'
            ? card.media.video?.provider
            : undefined;

        return provider === 'vimeo' || provider === 'youtube'
          ? { iframe: frameRef.nativeElement, provider }
          : null;
      })
      .filter(
        (
          item,
        ): item is {
          iframe: HTMLIFrameElement;
          provider: 'vimeo' | 'youtube';
        } => item !== null,
      );

    this.videoPlayer.retryAllVideos(this.videos, 250);
    this.videoPlayer.retryAllVideos(this.videos, 500);
  }

  private buildGfxRows(items: GfxWorkItem[], size: number = 3): GfxCard[][] {
    const rows: GfxCard[][] = [];

    for (let i = 0; i < items.length; i += size) {
      const chunk: GfxCard[] = items.slice(i, i + size).map((item) => {
        let rawUrl = '';
        let uploadUrl: string | undefined;
        let imageUrl: string | undefined;

        if (item.media.mediaType === 'video' && item.media.video) {
          const video = item.media.video;

          if (video.sourceType === 'external') {
            if (
              (video.provider === 'vimeo' || video.provider === 'youtube') &&
              video.url
            ) {
              rawUrl = this.videoPlayer.buildEmbedUrl(
                video.url,
                video.provider,
              );
            } else if (video.provider === 'direct' && video.url) {
              rawUrl = video.url;
            }
          } else if (video.sourceType === 'upload') {
            uploadUrl = video.videoFile?.asset?.url || '';
          }
        }

        if (item.media.mediaType === 'image') {
          imageUrl = item.media.image?.asset?.url || '';
        }

        return {
          route: item.route,
          media: item.media,
          safeUrl: rawUrl
            ? this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl)
            : undefined,
          uploadUrl,
          imageUrl,
        };
      });

      rows.push(chunk);
    }

    return rows;
  }

  @HostListener('window:orientationchange')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.videoPlayer.retryAllVideos(this.videos, 250);
  }
}
