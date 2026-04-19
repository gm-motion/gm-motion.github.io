import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren,} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {Subscription} from 'rxjs';

import {SanityContentService} from '../core/sanity/sanity-content.service';
import {VideoItem, VideoSource} from '../core/sanity/schemas/commonSchemas';
import {PhotoMediaItem} from '../core/sanity/schemas/workPage';

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

  private fadeObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;
  private headerObserver!: IntersectionObserver;

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
            rawUrl = item.video.url;
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

  ngOnDestroy(): void {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.fadeItemsSub?.unsubscribe();
  }
}
