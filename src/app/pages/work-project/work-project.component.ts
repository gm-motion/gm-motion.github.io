import {CommonModule} from '@angular/common';
import {Component, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {map, of, switchMap} from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {FadeInDirective} from '../../core/directives/fade-in.directive';
import {HeaderAnimationDirective} from '../../core/directives/header-animation.directive';
import { VideoSource } from '../../core/models/sanity/commonSchemas';
import { GfxProject, GfxProjectSection } from '../../core/models/sanity/gfxProjectPage';
import {SanityContentService} from '../../core/sanity/sanity-content.service';
import { VideoPlayerService } from '../../core/services/video-player.service';

interface MediaImage {
  asset?: {url?: string};
}

interface MediaSource {
  mediaType: 'video'|'image';
  alt?: string;
  video?: VideoSource;
  image?: MediaImage;
}

interface ResolvedMediaSource extends MediaSource {
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
  imageUrl?: string;

  aspectRatio?: number;
  idealWidth?: number;
}

interface ResolvedGfxProjectSection {
  subheader?: string;
  banner?: {asset?: {url?: string}; alt?: string;};
  paragraphs?: string[];
  columns?: number;
  mediaHeader?: string;
  mediaItems: ResolvedMediaSource[];
}

interface ResolvedGfxProject {
  title: string;
  subheader: string;
  slug: string;
  thumbnail?: VideoSource;
  sections?: ResolvedGfxProjectSection[];
}

@Component({
  selector: 'app-work-project',
  imports: [FadeInDirective, HeaderAnimationDirective],
  templateUrl: './work-project.component.html',
  styleUrl: './work-project.component.css',
})
export class WorkProjectComponent implements OnInit {
  project = signal<ResolvedGfxProject | null>(null);
  isLoading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private sanityContentService: SanityContentService,
    private videoPlayer: VideoPlayerService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('slug')),
        switchMap((slug) => {
          console.log(slug);

          if (!slug) {
            this.isLoading.set(false);
            return of(null);
          }

          this.isLoading.set(true);
          return this.sanityContentService.getWorkProjectBySlug(slug);
        }),
      )
      .subscribe({
        next: (newProject) => {
          if (!newProject) {
            this.project.set(null);
            this.isLoading.set(false);
            return;
          }

          this.project.set({
            title: newProject.title,
            subheader: newProject.subheader,
            slug: newProject.slug,
            thumbnail: newProject.thumbnail,
            sections: this.buildGfxProjectSections(newProject.sections ?? []),
          });

          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load GFX project:', err);
          this.project.set(null);
          this.isLoading.set(false);
        },
      });
  }

  private buildGfxProjectSections(
    items: GfxProjectSection[],
  ): ResolvedGfxProjectSection[] {
    console.log(items[0])
    return items.map((item) => ({
      subheader: item.subheader,
      banner: item.banner,
      paragraphs: item.paragraphs ?? [],
      columns: item.columns ?? 1,
      mediaHeader: item.mediaHeader,
      mediaItems: this.buildResolvedMediaItems(item.mediaItems ?? []),
    }));
  }

  private buildResolvedMediaItems(items: MediaSource[]): ResolvedMediaSource[] {
    return items.map((media) => {
      let safeUrl: SafeResourceUrl | undefined;
      let uploadUrl: string | undefined;
      let imageUrl: string | undefined;

      if (media.mediaType === 'video' && media.video) {
        const video = media.video;

        if (video.sourceType === 'external') {
          if (
            (video.provider === 'vimeo' || video.provider === 'youtube') &&
            video.url
          ) {
            safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              this.videoPlayer.buildEmbedUrl(video.url, video.provider),
            );
          } else if (video.provider === 'direct' && video.url) {
            uploadUrl = video.url;
          }
        } else if (video.sourceType === 'upload') {
          uploadUrl = video.videoFile?.asset?.url;
        }
      }

      if (media.mediaType === 'image') {
        imageUrl = media.image?.asset?.url;
      }

      return {
        ...media,
        safeUrl,
        uploadUrl,
        imageUrl,
        aspectRatio: undefined,
      };
    });
  }

  setImageAspectRatio(
    media: ResolvedMediaSource,
    event: Event,
    section: ResolvedGfxProjectSection,
  ): void {
    const img = event.target as HTMLImageElement;

    media.aspectRatio = img.naturalWidth / img.naturalHeight;
    this.setIdealMediaWidth(media, section);
  }

  setVideoAspectRatio(
    media: ResolvedMediaSource,
    event: Event,
    section: ResolvedGfxProjectSection,
  ): void {
    const video = event.target as HTMLVideoElement;

    media.aspectRatio = video.videoWidth / video.videoHeight;
    this.setIdealMediaWidth(media, section);
  }

  private readonly GRID_GAP_PX = 32; // 2rem if root font-size is 16px

  private setIdealMediaWidth(
    media: ResolvedMediaSource,
    section: ResolvedGfxProjectSection,
  ): void {
    const columns = section.columns || 1;

    const viewportWidth = window.innerWidth;
    const gridMaxWidth = Math.min(viewportWidth, 1200); // change to your actual section max-width

    const totalGap = this.GRID_GAP_PX * (columns - 1);
    const columnWidth = (gridMaxWidth - totalGap) / columns;

    media.idealWidth = columnWidth;
  }

  setExternalVideoAspectRatio(
    media: ResolvedMediaSource,
    section: ResolvedGfxProjectSection,
  ): void {
    media.aspectRatio = media.aspectRatio ?? 16 / 9;
    this.setIdealMediaWidth(media, section);
  }
}
