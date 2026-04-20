import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {RouterLink} from '@angular/router';

import {FadeInDirective} from '../core/directives/fade-in.directive';
import {HeaderAnimationDirective} from '../core/directives/header-animation.directive';
import {VideoItem, VideoSource} from '../core/models/sanity/commonSchemas';
import {SanityContentService} from '../core/sanity/sanity-content.service';
import {VideoPlayerService} from '../core/services/video-player.service';

interface MediaImage {
  asset?: {url?: string;};
}

interface MediaSource {
  mediaType: 'video'|'image';
  alt?: string;
  video?: VideoSource;
  image?: MediaImage;
}

interface GfxCard {
  route: string;
  video: VideoSource;
  safeUrl?: SafeResourceUrl;
  uploadUrl?: string;
}

interface PhotoVideoCard {
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
export class WorkComponent implements OnInit {

  gfxSubHeader = '';
  photoVideoParagraph = '';

  gfxWorkMedia: VideoItem[] = [];
  photoVideoMedia: PhotoVideoCard[] = [];

  isGfxLoading = true;

  gfxWorkRows: GfxCard[][] = Array.from(
      {length: 2},
      () => Array.from({length: 3}, () => ({
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
      } else {
        this.gfxWorkRows = [];
        this.isGfxLoading = false;
      }

      if (workPageData?.photoVideoMedia?.length) {
        this.photoVideoMedia = this.buildPhotoVideoMedia(
            workPageData.photoVideoMedia,
        );
      }

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load Work Page Schema from Sanity:', error);
      this.isGfxLoading = false;
      this.cdr.markForCheck();
    }
  }

  private buildGfxRows(items: VideoItem[], size: number = 3): GfxCard[][] {
    const rows: GfxCard[][] = [];

    for (let i = 0; i < items.length; i += size) {
      const chunk: GfxCard[] = items.slice(i, i + size).map((item) => {
        let rawUrl = '';

        if (item.video.sourceType === 'external') {
          if ((item.video.provider === 'vimeo' ||
               item.video.provider === 'youtube') &&
              item.video.url) {
            rawUrl = this.videoPlayer.buildEmbedUrl(
                item.video.url, item.video.provider);
          } else if (item.video.provider === 'direct' && item.video.url) {
            rawUrl = item.video.url;
          }
        }

        return {
          route: item.route,
          video: item.video,
          safeUrl: rawUrl ?
              this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl) :
              undefined,
          uploadUrl: item.video.sourceType === 'upload' ?
              item.video.videoFile?.asset?.url || '' :
              undefined,
        };
      });

      rows.push(chunk);
    }

    return rows;
  }

  private buildPhotoVideoMedia(
      items: {media: MediaSource}[],
      ): PhotoVideoCard[] {
    return items.map((item) => {
      let safeUrl: SafeResourceUrl|undefined;
      let uploadUrl: string|undefined;
      let imageUrl: string|undefined;

      if (item.media.mediaType === 'video' && item.media.video) {
        const video = item.media.video;

        if (video.sourceType === 'external') {
          if ((video.provider === 'vimeo' || video.provider === 'youtube') &&
              video.url) {
            safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
                this.videoPlayer.buildEmbedUrl(video.url, video.provider),
            );
          } else if (video.provider === 'direct' && video.url) {
            uploadUrl = video.url;
          }
        } else if (video.sourceType === 'upload') {
          uploadUrl = video.videoFile?.asset?.url || '';
        }
      }

      if (item.media.mediaType === 'image') {
        imageUrl = item.media.image?.asset?.url || '';
      }

      return {
        media: item.media,
        safeUrl,
        uploadUrl,
        imageUrl,
      };
    });
  }
}
