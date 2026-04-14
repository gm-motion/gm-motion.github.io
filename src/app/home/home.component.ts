import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  ViewChild,
  ElementRef,
  QueryList,
  HostListener,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('stackCard') stackCards!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('stackStage', { static: false })
  stackStage!: ElementRef<HTMLElement>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;

  private fadeObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;
  private headerObserver?: IntersectionObserver;

  ngAfterViewInit() {
    const headerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    });

    this.headerElements.forEach((header) =>
      headerObserver.observe(header.nativeElement),
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
    this.updateStackCards();
  }

  private observeFadeItems(): void {
    this.fadeItems.forEach((item) => {
      const el = item.nativeElement;

      if (!el.classList.contains('visible')) {
        this.fadeObserver.observe(el);
      }
    });
  }

  ngOnDestroy() {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.headerObserver?.disconnect();
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
