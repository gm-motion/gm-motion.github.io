import {AfterViewInit, HostListener, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren,} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';

import {SanityContentService} from '../core/sanity/sanity-content.service';
import {VideoItem, VideoSource} from '../core/sanity/schemas/commonSchemas';
import {PhotoMediaItem} from '../core/sanity/schemas/workPage';
import Player from '@vimeo/player';

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
  @ViewChildren('vimeoFrame') vimeoFrames!: QueryList<
    ElementRef<HTMLIFrameElement>
  >;

  private fadeObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;
  private headerObserver!: IntersectionObserver;

  private players = new Map<HTMLIFrameElement, Player>();
  private retryTimeouts: number[] = [];

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

    this.initVimeoPlayers();

    // same idea as your banner restart:
    this.scheduleVideoRetry(400);
    this.scheduleVideoRetry(1200);
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
          if (item.video.provider === 'vimeo' && item.video.url) {
            rawUrl = this.buildVimeoEmbed(item.video.url);
          } else if (item.video.provider === 'youtube' && item.video.url) {
            rawUrl = this.buildYouTubeEmbed(item.video.url);
          } else if (item.video.provider === 'direct' && item.video.url) {
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
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    );

    if (!match) return '';

    const id = match[1];

    const params = new URLSearchParams();

    params.set('autoplay', '1');
    params.set('mute', '1'); // required for autoplay
    params.set('loop', '1');
    params.set('playlist', id); // REQUIRED for looping
    params.set('controls', '0'); // optional: cleaner look
    params.set('playsinline', '1');
    params.set('rel', '0'); // no related videos
    params.set('modestbranding', '1');
    params.set('controls', '0');
    params.set('showinfo', '0'); // deprecated but harmless
    params.set('fs', '0'); // disable fullscreen button

    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }

  @HostListener('window:orientationchange')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.scheduleVideoRetry(250);
  }

  private initVimeoPlayers(): void {
    this.vimeoFrames.forEach((frameRef) => {
      const iframe = frameRef.nativeElement;

      if (this.players.has(iframe)) return;

      const player = new Player(iframe);
      this.players.set(iframe, player);
    });
  }

  private scheduleVideoRetry(delayMs: number): void {
    const id = window.setTimeout(() => {
      this.retryAllVideos();
    }, delayMs);

    this.retryTimeouts.push(id);
  }

  private retryAllVideos(): void {
    this.vimeoFrames.forEach((frameRef) => {
      this.retryVideo(frameRef.nativeElement);
    });
  }

  private async retryVideo(iframe: HTMLIFrameElement): Promise<void> {
    const player = this.players.get(iframe);
    if (!player) return;

    try {
      await player.ready();

      const paused = await player.getPaused().catch(() => true);

      if (paused) {
        await player.play();
      }
    } catch {
      this.hardReloadVideo(iframe);
    }
  }

  private hardReloadVideo(iframe: HTMLIFrameElement): void {
    const src = iframe.src;
    iframe.src = '';

    requestAnimationFrame(() => {
      iframe.src = src;

      // recreate player after reload
      const player = new Player(iframe);
      this.players.set(iframe, player);

      window.setTimeout(async () => {
        try {
          await player.ready();
          await player.play();
        } catch {
          // leave it alone if autoplay is blocked
        }
      }, 500);
    });
  }

  ngOnDestroy(): void {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.fadeItemsSub?.unsubscribe();
  }
}
