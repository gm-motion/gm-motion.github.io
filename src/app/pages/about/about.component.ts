import { SanityContentService } from '../../core/sanity/sanity-content.service';
import {
  AfterViewInit,
  OnInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimelineItem } from '../../core/models/sanity/aboutPage';
import { Paragraph } from '../../core/models/sanity/commonSchemas';
import { RouterLink } from '@angular/router';
import { FadeInDirective } from '../../core/directives/fade-in.directive';
import { HeaderAnimationDirective } from '../../core/directives/header-animation.directive';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    RouterLink,
    FadeInDirective,
    HeaderAnimationDirective,
  ],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nameElement') nameElement!: ElementRef<HTMLElement>;

  private nameObserver!: IntersectionObserver;

  headshot = '/assets/about/headshot.webp';
  aboutInfoParagraphs: Paragraph[] = [];
  headshotAlt = '';

  timelineItems: TimelineItem[] = [];

  constructor(
    private sanityContentService: SanityContentService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      const aboutData = await this.sanityContentService.getAboutPage();

      if (aboutData?.headshot?.asset?.url) {
        this.headshot = aboutData.headshot.asset.url;
      }

      if (aboutData?.headshot?.alt) {
        this.headshotAlt = aboutData.headshot.alt;
      }

      if (aboutData?.aboutInfoParagraphs?.length) {
        this.aboutInfoParagraphs = [...aboutData.aboutInfoParagraphs];
      }

      if (aboutData?.timelineItems?.length) {
        this.timelineItems = [...aboutData.timelineItems];
        console.log(this.timelineItems);
      }

      this.cdr.markForCheck();
    } catch (error) {
      console.error('Failed to load About Schema from Sanity:', error);
    }
  }

  ngAfterViewInit() {
    this.nameObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('red-name');
            this.nameObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    this.nameObserver.observe(this.nameElement.nativeElement);
  }

  ngOnDestroy(): void {
    this.nameObserver?.disconnect();
  }
}
