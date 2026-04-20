import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { FadeInDirective } from '../core/directives/fade-in.directive';
import { HeaderAnimationDirective } from '../core/directives/header-animation.directive';
import { SanityContentService } from '../core/sanity/sanity-content.service';
import {
  Paragraph,
  VideoSource,
  MediaSource,
  GfxWorkItem,
} from '../core/models/sanity/commonSchemas';
import { HomeData, PartneredClientItem } from '../core/models/sanity/homePage';
import { VideoPlayerService } from '../core/services/video-player.service';
import { VideoProvider } from '../core/models/video.types';


interface ResolvedMediaSource extends MediaSource {
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
  imageUrl?: string;
  imageLoaded?: boolean;
}

interface ResolvedGfxWorkItem {
  route: string;
  media: ResolvedMediaSource;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, FadeInDirective, HeaderAnimationDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChildren('stackCard') stackCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('stackStage', { static: false })
  stackStage!: ElementRef<HTMLElement>;
  @ViewChild('carousel') carousel?: ElementRef<HTMLElement>;
  @ViewChild('titleVideoFrame')
  titleVideoFrame!: ElementRef<HTMLIFrameElement>;
  @ViewChildren('stackVideoFrame') stackVideoFrames!: QueryList<
    ElementRef<HTMLIFrameElement>
  >;
  @ViewChildren('workVideoFrame') workVideoFrames!: QueryList<
    ElementRef<HTMLIFrameElement>
  >;

  homeVideoStack: ResolvedMediaSource[] = Array.from({ length: 3 }, () => ({
    mediaType: 'video',
    video: {
      name: '',
      description: '',
      sourceType: 'external',
    },
    safeUrl: undefined,
    uploadUrl: undefined,
  }));

  titleVideo?: ResolvedMediaSource;

  headQuote = '';
  headParagraphs: Paragraph[] = [];

  gfxWorkSection: ResolvedGfxWorkItem[] = [];
  partneredClientsSection: PartneredClientItem[] = [];

  constructor(
    private sanitizer: DomSanitizer,
    private sanityContentService: SanityContentService,
    private cdr: ChangeDetectorRef,
    private videoPlayer: VideoPlayerService,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const homePageData: HomeData | null =
        await this.sanityContentService.getHomePage();

      if (homePageData?.titleVideo) {
        this.titleVideo = this.resolveVideoSource(homePageData.titleVideo);
      }

      if (homePageData?.headQuote) {
        this.headQuote = homePageData.headQuote;
      }

      if (homePageData?.headParagraphs) {
        this.headParagraphs = [...homePageData.headParagraphs];
      }

      if (homePageData?.videoStack?.length) {
        this.homeVideoStack = homePageData.videoStack.map((video) =>
          this.resolveVideoSource(video),
        );
        console.log(this.homeVideoStack);
      }

      if (homePageData?.gfxWorkSection?.length) {
        this.gfxWorkSection = homePageData.gfxWorkSection.map((item) =>
          this.resolveGfxWorkItem(item),
        );
      }

      if (homePageData?.partneredClientsSection?.length) {
        this.partneredClientsSection = [
          ...homePageData.partneredClientsSection,
        ];
      }

      requestAnimationFrame(() => {
        this.updateStackCards();
      });

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load Home Page Schema from Sanity:', error);
    }
  }

  ngAfterViewInit() {
    this.updateStackCards();

    this.retryTitleVideo();
    this.retryStackVideos();
    this.retryWorkVideos();

    setTimeout(() => this.restartCarouselAnimation(), 100);
    setTimeout(() => this.restartCarouselAnimation(), 500);
  }

  private resolveMediaSource(media: MediaSource): ResolvedMediaSource {
    let rawUrl = '';
    let uploadUrl: string | undefined;
    let imageUrl: string | undefined;

    if (media.mediaType === 'video' && media.video) {
      const video = media.video;

      if (
        video.sourceType === 'external' &&
        video.url &&
        (video.provider === 'vimeo' || video.provider === 'youtube')
      ) {
        rawUrl = this.videoPlayer.buildEmbedUrl(video.url, video.provider);
      } else if (video.provider === 'direct' && video.url) {
        uploadUrl = video.url;
      } else if (video.sourceType === 'upload') {
        uploadUrl = video.videoFile?.asset?.url || '';
      }
    }

    if (media.mediaType === 'image') {
      imageUrl = media.image?.asset?.url || '';
    }

    return {
      ...media,
      safeUrl: rawUrl
        ? this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl)
        : undefined,
      uploadUrl,
      imageUrl,
      imageLoaded: false,
    };
  }

  private resolveGfxWorkItem(item: GfxWorkItem): ResolvedGfxWorkItem {
    return {
      route: item.route,
      media: this.resolveMediaSource(item.media),
    };
  }

  private resolveVideoSource(video: VideoSource): ResolvedMediaSource {
    return this.resolveMediaSource({
      mediaType: 'video',
      video,
    });
  }

  @HostListener('window:orientationchange')
  @HostListener('window:resize')
  onViewportChange(): void {
    this.restartCarouselAnimation();
    this.retryTitleVideo();
    this.retryStackVideos();
    this.retryWorkVideos();
  }

  private restartCarouselAnimation(): void {
    const el = this.carousel?.nativeElement;
    if (!el) return;

    this.videoPlayer.restartAnimation(el);
  }

  private isRetryableProvider(
    provider: VideoProvider | 'direct' | undefined,
  ): provider is VideoProvider {
    return provider === 'vimeo' || provider === 'youtube';
  }

  private buildRetryGroup(
    frames: QueryList<ElementRef<HTMLIFrameElement>>,
    videos: { provider?: VideoProvider | 'direct' }[],
  ): { iframe: HTMLIFrameElement; provider: VideoProvider }[] {
    return frames
      .toArray()
      .map((frameRef, i) => {
        const provider = videos[i]?.provider;

        if (!this.isRetryableProvider(provider)) {
          return null;
        }

        return {
          iframe: frameRef.nativeElement,
          provider,
        };
      })
      .filter(
        (
          item,
        ): item is { iframe: HTMLIFrameElement; provider: VideoProvider } =>
          item !== null,
      );
  }

  private retryTitleVideo(): void {
    const iframe = this.titleVideoFrame?.nativeElement;
    const provider =
      this.titleVideo?.mediaType === 'video'
        ? this.titleVideo.video?.provider
        : undefined;

    if (!iframe || !this.isRetryableProvider(provider)) return;

    this.videoPlayer.retryAllVideos([{ iframe, provider }], 400);
    this.videoPlayer.retryAllVideos([{ iframe, provider }], 1200);
  }

  private retryStackVideos(): void {
    const stackVideos = this.homeVideoStack
      .filter(
        (media): media is ResolvedMediaSource =>
          media.mediaType === 'video' && !!media.video,
      )
      .map((media) => media.video!);

    const videos = this.buildRetryGroup(this.stackVideoFrames, stackVideos);

    this.videoPlayer.retryAllVideos(videos, 500);
    this.videoPlayer.retryAllVideos(videos, 1300);
  }

  private retryWorkVideos(): void {
    const workVideos = this.gfxWorkSection
      .map((item) => item.media)
      .filter(
        (media): media is ResolvedMediaSource =>
          media.mediaType === 'video' && !!media.video,
      )
      .map((media) => media.video!);

    const videos = this.buildRetryGroup(this.workVideoFrames, workVideos);

    this.videoPlayer.retryAllVideos(videos, 500);
    this.videoPlayer.retryAllVideos(videos, 1300);
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize() {
    this.updateStackCards();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  private isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  private updateStackCards(): void {
    if (this.isMobile()) return; // skip animation on mobile
    if (!this.stackCards?.length || !this.stackStage) return;

    const vh = window.innerHeight;
    const vw = window.innerWidth;

    const collapsedHeight = Math.max(120, vh * 0.25);
    const expandedHeight = (vw * 0.9 * 9) / 16;

    const growDistance = vh * 0.9; // was 1.5
    const holdDistance = vh * 0.4; // was 1.2
    const shrinkDistance = vh * 0.9; // was 1.5
    const cycleDistance = growDistance + holdDistance + shrinkDistance;

    const cardCount = this.stackCards.length;
    const maxScroll = cycleDistance * cardCount - 1;

    const stage = this.stackStage.nativeElement;
    stage.style.height = `${vh + cycleDistance * cardCount}px`;

    const stageRect = stage.getBoundingClientRect();
    const scrolled = this.clamp(-stageRect.top, 0, maxScroll);

    const baseIndex = Math.min(
      cardCount - 1,
      Math.floor(scrolled / cycleDistance),
    );
    const localScroll = scrolled - baseIndex * cycleDistance;

    let t = 0;
    if (localScroll <= growDistance) {
      t = this.smoothstep(localScroll / growDistance);
    } else if (localScroll <= growDistance + holdDistance) {
      t = 1;
    } else {
      const p = (localScroll - growDistance - holdDistance) / shrinkDistance;
      t = 1 - this.smoothstep(this.clamp(p, 0, 1));
    }

    const heights: number[] = new Array(cardCount).fill(collapsedHeight);
    heights[baseIndex] = this.lerp(collapsedHeight, expandedHeight, t);

    const gap = 16; // 1rem in px

    const buildLayout = (centerIndex: number): number[] => {
      const tops = new Array(cardCount).fill(0);
      tops[centerIndex] = (vh - heights[centerIndex]) / 2;

      for (let i = centerIndex + 1; i < cardCount; i++) {
        tops[i] = tops[i - 1] + heights[i - 1] + gap;
      }

      for (let i = centerIndex - 1; i >= 0; i--) {
        tops[i] = tops[i + 1] - heights[i] - gap;
      }

      return tops;
    };

    let tops = buildLayout(baseIndex);

    // smooth handoff to the next centered card instead of snapping
    const handoffDistance = vh * 0.45;
    if (baseIndex < cardCount - 1) {
      const handoffStart = cycleDistance - handoffDistance;

      if (localScroll > handoffStart) {
        const mix = this.smoothstep(
          this.clamp((localScroll - handoffStart) / handoffDistance, 0, 1),
        );

        const nextTops = buildLayout(baseIndex + 1);
        tops = tops.map((top, i) => this.lerp(top, nextTops[i], mix));
      }
    }

    this.stackCards.forEach((cardRef, i) => {
      const card = cardRef.nativeElement;

      card.style.height = `${Math.round(heights[i])}px`;
      card.style.top = `${tops[i]}px`; // no rounding — let the browser sub-pixel render
      card.style.left = '50%';
      card.style.transform = 'translateX(-50%) translateZ(0)';

      if (i === baseIndex) {
        card.style.zIndex = '30';
      } else if (i === baseIndex + 1) {
        card.style.zIndex = '20';
      } else {
        card.style.zIndex = '10';
      }
    });
  }

  @ViewChild('infoPanel') infoPanel!: ElementRef<HTMLElement>;

  scrollDown() {
    if (this.infoPanel) {
      this.infoPanel.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isMobile()) {
      // clear any inline styles the JS may have already set
      this.stackCards?.forEach((cardRef) => {
        const card = cardRef.nativeElement;
        card.style.height = '';
        card.style.top = '';
        card.style.left = '';
        card.style.transform = '';
        card.style.zIndex = '';
      });
      if (this.stackStage) {
        this.stackStage.nativeElement.style.height = '';
      }
      return;
    }
    this.updateStackCards();
  }
}
