import {
  Component,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-work',
  imports: [RouterLink],
  templateUrl: './work.component.html',
  styleUrls: ['./work.component.css'],
})
export class WorkComponent implements OnDestroy, AfterViewInit {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;

  private fadeObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;
  private headerObserver!: IntersectionObserver;

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

  ngOnDestroy(): void {
    this.fadeObserver?.disconnect();
    this.headerObserver?.disconnect();
    this.fadeItemsSub?.unsubscribe();
  }
}
