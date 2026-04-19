import {AfterViewInit, Directive, ElementRef, inject, OnDestroy, Renderer2,} from '@angular/core';

@Directive({
  selector: '[fadeIn]',
  standalone: true,
})
export class FadeInDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);
  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.renderer.addClass(this.el.nativeElement, 'visible');
              this.observer?.unobserve(this.el.nativeElement);
            }
          });
        },
        {
          threshold: 0.1,
        },
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}