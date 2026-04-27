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
import { TimelineItem, Mentor } from '../../core/models/sanity/aboutPage';
import { Paragraph } from '../../core/models/sanity/commonSchemas';
import { RouterLink } from '@angular/router';
import { FadeInDirective } from '../../core/directives/fade-in.directive';
import { HeaderAnimationDirective } from '../../core/directives/header-animation.directive';
import { HammerModule } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  imports: [
    CommonModule,
    RouterLink,
    FadeInDirective,
    HeaderAnimationDirective,
    HammerModule
  ],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('nameElement') nameElement!: ElementRef<HTMLElement>;

  private nameObserver!: IntersectionObserver;

  headshot = '/assets/about/headshot.webp';
  aboutInfoParagraphs: Paragraph[] = [];
  headshotAlt = '';
  timelineItems: TimelineItem[] = [];
  mentors: Mentor[] = [];
  aspirationParagraphs: Paragraph[] = [];

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
      }

      if (aboutData?.aspirationParagraphs?.length) {
        this.aspirationParagraphs = [...aboutData.aspirationParagraphs];
        console.log("Check", this.aspirationParagraphs)
      }

      if (aboutData?.mentors?.length) {
        this.mentors = [...aboutData.mentors];
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

  selectedIndex = 0;
  isTransitioning = false;

  get currentIndex(): number {
    const total = this.mentors.length;
    return ((this.selectedIndex % total) + total) % total;
  }

  getIndex(i: number): number {
    const total = this.mentors.length;
    const rawOffset = i - this.currentIndex;
    const half = Math.floor(total / 2);

    if (rawOffset > half) return rawOffset - total;
    if (rawOffset < -half) return rawOffset + total;

    return rawOffset;
  }

  showPrev(_: number): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.selectedIndex--;

    setTimeout(() => {
      this.isTransitioning = false;
    }, 250);
  }

  showNext(_: number): void {
    if (this.isTransitioning) return;

    this.isTransitioning = true;
    this.selectedIndex++;

    setTimeout(() => {
      this.isTransitioning = false;
    }, 250);
  }

  goTo(index: number): void {
    this.selectedIndex = index;
  }

  ngOnDestroy(): void {
    this.nameObserver?.disconnect();
  }
}
