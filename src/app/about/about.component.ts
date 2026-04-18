import { AsyncPipe, NgClass } from '@angular/common';
import { SanityContentService } from '../core/sanity/sanity-content.service';
import {
  AfterViewInit,
  OnInit,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChild,
  ViewChildren,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import {TimelineItem} from '../core/sanity/schemas/aboutPage';
import {Paragraph} from '../core/sanity/schemas/commonSchemas';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterLink],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;
  @ViewChild('nameElement') nameElement!: ElementRef<HTMLElement>;

  private fadeObserver!: IntersectionObserver;
  private headerObserver!: IntersectionObserver;
  private nameObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;

  headshot = '';
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
    this.headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    this.headerElements.forEach((header) =>
      this.headerObserver.observe(header.nativeElement),
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

    console.log(this.nameElement);

    this.nameObserver.observe(this.nameElement.nativeElement);
  }

  private observeFadeItems(): void {
    this.fadeItems.forEach((item) => {
      const el = item.nativeElement;

      if (!el.classList.contains('visible')) {
        this.fadeObserver.observe(el);
      }
    });
  }

  ngOnDestroy(): void {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.nameObserver?.disconnect();
    this.fadeItemsSub?.unsubscribe();
  }
}
