import { AsyncPipe, NgClass } from '@angular/common';

import {
  AfterViewInit,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  QueryList,
  signal,
  ViewChild,
  WritableSignal,
  ViewChildren,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export interface AboutSections {
  name: string;
  paragraph: string;
}

@Component({
  selector: 'app-about',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;
  @ViewChild('nameElement') nameElement!: ElementRef<HTMLElement>;

  private fadeObserver!: IntersectionObserver;
  private headerObserver!: IntersectionObserver;
  private nameObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;

  timelineItems = [
    {
      company: 'Carolina Hurricanes',
      title: 'Senior Motion Graphics Designer',
      date: "Dec'24 - Present",
      logo: 'assets/home/clients/carolina-hurricanes.png',
      side: 'left',
      milestones: [
        {
          date: "May'25",
          title: 'Eastern Conference Finals',
          description: 'Hurricanes make the ECF again ',
        },
        {
          date: "Jan'25",
          title: 'Eric Staal Jersey Retirement',
          description:
            'Designed a full motion package for Eric Staal`s jersey retirement.',
        },
      ],
    },
    {
      company: 'Detroit Red Wings',
      title: 'Motion Graphics Artist',
      date: "Sep'23 - Dec'24",
      logo: 'assets/home/clients/red-wings.png',
      side: 'right',
      milestones: [
        {
          date: "Nov'24",
          title: 'Milestone One',
          description: 'Description of something that occurred.',
        },
        {
          date: "Feb'23",
          title: 'Milestone Two',
          description: 'Description of something that occurred.',
        },
      ],
    },
    {
      company: 'Detroit Tigers',
      title: 'Motion Graphics Artist',
      date: "Sep'23 - Dec'24",
      logo: 'assets/home/clients/tigers.png',
      side: 'left',
      milestones: [
        {
          date: "Jul'24",
          title: 'Tigers Clinch Playoffs',
          description:
            'Description of graphics that were animated',
        },
      ],
    },
    {
      company: 'Charlotte Checkers',
      title: 'Motion Graphics Designer',
      date: "Oct'21 - Oct'23",
      logo: 'assets/home/clients/checkers.png',
      side: 'right',
      milestones: [
        {
          date: "Jan'26",
          title: 'Project One',
          description: 'Description here.',
        },
      ],
    },
  ];

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
