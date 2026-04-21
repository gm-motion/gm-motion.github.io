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
  asset?: { url?: string };
}

interface MediaSource {
  mediaType: 'video' | 'image';
  alt?: string;
  video?: VideoSource;
  image?: MediaImage;
}

interface ResolvedGfxProjectSection {
  subheader?: string;
  paragraph?: string;
  media: MediaSource;
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
  imageUrl?: string;
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
            sections: this.buildGfxProjectSection(newProject.sections ?? []),
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

  private buildGfxProjectSection(
    items: GfxProjectSection[],
  ): ResolvedGfxProjectSection[] {
    return items
      .filter(
        (item): item is GfxProjectSection & { media: MediaSource } =>
          !!item.media,
      )
      .map((item) => {
        let safeUrl: SafeResourceUrl | undefined;
        let uploadUrl: string | undefined;
        let imageUrl: string | undefined;

        if (item.media.mediaType === 'video' && item.media.video) {
          const video = item.media.video;

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

        if (item.media.mediaType === 'image') {
          imageUrl = item.media.image?.asset?.url;
        }

        return {
          subheader: item.subheader,
          paragraph: item.paragraph,
          media: item.media,
          safeUrl,
          uploadUrl,
          imageUrl,
        };
      });
  }

  getVideoUrl(video?: {
    url?: string;
    videoFile?: { asset?: { url?: string } };
  }): string | undefined {
    return video?.videoFile?.asset?.url || video?.url;
  }
}
