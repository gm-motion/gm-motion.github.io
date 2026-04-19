import {
  AfterViewInit,
  HostListener,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { SanityContentService } from '../core/sanity/sanity-content.service';
import { VideoItem, VideoSource } from '../core/models/sanity/commonSchemas';
import { PhotoMediaItem } from '../core/models/sanity/workPage';
import { VideoPlayerService } from '../core/services/video-player.service';
import { VideoProvider } from '../core/models/video.types';

interface GfxCard {
  route: string;
  video: VideoSource;
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
}

@Component({
  selector: 'app-work',
  imports: [RouterLink],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;
  @ViewChildren('videoFrame') videoFrames!: QueryList<
    ElementRef<HTMLIFrameElement>
  >;

  private fadeObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;
  private headerObserver!: IntersectionObserver;

  private videos: { iframe: HTMLIFrameElement; provider: VideoProvider }[] = [];

  gfxSubHeader = '';
  photoVideoParagraph = '';

  gfxWorkMedia: VideoItem[] = [];
  photoVideoMedia: PhotoMediaItem[] = [];

  isGfxLoading = true;

  gfxWorkRows: GfxCard[][] = Array.from({ length: 2 }, () =>
    Array.from({ length: 3 }, () => ({
      route: '/',
      safeUrl: '',
      uploadUrl: '',
      video: {
        name: '',
        sourceType: 'upload',
        uploadUrl: '',
        safeUrl: '',
        description: '',
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
      }

      if (workPageData?.photoVideoMedia?.length) {
        this.photoVideoMedia = [...workPageData.photoVideoMedia];
      }

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load Work Page Schema from Sanity:', error);
    }
  }

  ngAfterViewInit() {
    this.headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    this.headerElements.forEach((el) =>
      this.headerObserver.observe(el.nativeElement),
    );

    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            this.fadeObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    this.observeFadeItems();

    this.fadeItemsSub = this.fadeItems.changes.subscribe(() => {
      this.observeFadeItems();
    });

    this.videos = this.videoFrames
      .toArray()
      .map((frameRef, i) => {
        const provider = this.gfxWorkMedia[i]?.video?.provider;
        return provider === 'vimeo' || provider === 'youtube'
          ? { iframe: frameRef.nativeElement, provider }
          : null;
      })
      .filter(
        (
          item,
        ): item is { iframe: HTMLIFrameElement; provider: 'vimeo' | 'youtube' } =>
          item !== null,
      );

    this.videoPlayer.retryAllVideos(this.videos, 250);
    this.videoPlayer.retryAllVideos(this.videos, 500);
  }

  private observeFadeItems(): void {
    this.fadeItems.forEach((item) => {
      const el = item.nativeElement;

      if (!el.classList.contains('visible')) {
        this.fadeObserver.observe(el);
      }
    });
  }

  private buildGfxRows(items: VideoItem[], size: number = 3): GfxCard[][] {
    const rows: GfxCard[][] = [];

    for (let i = 0; i < items.length; i += size) {
      const chunk: GfxCard[] = items.slice(i, i + size).map((item) => {
        let rawUrl = '';

        if (item.video.sourceType === 'external') {

          if ((item.video.provider === 'vimeo' || item.video.provider === 'youtube') && item.video.url ) {
            rawUrl = this.videoPlayer.buildEmbedUrl(item.video.url, item.video.provider);
          }
          else if (item.video.provider === 'direct' && item.video.url) {
            rawUrl = item.video.url;
          }
        }

        return {
          route: item.route,
          video: item.video,
          safeUrl: rawUrl
            ? this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl)
            : undefined,
          uploadUrl:
            item.video.sourceType === 'upload'
              ? item.video.videoFile?.asset?.url || ''
              : undefined,
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

  ngOnDestroy(): void {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.fadeItemsSub?.unsubscribe();
  }
}
