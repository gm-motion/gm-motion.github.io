import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChildren,
  ElementRef,
  QueryList,
  signal,
} from '@angular/core';
import emailjs from 'emailjs-com';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent implements OnDestroy, AfterViewInit {
  @ViewChildren('headerEl') headerElements!: QueryList<ElementRef>;
  @ViewChildren('fadeItem') fadeItems!: QueryList<ElementRef>;

  private fadeObserver!: IntersectionObserver;
  private headerObserver!: IntersectionObserver;
  private fadeItemsSub?: Subscription;

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

  sendEmailTriggered = signal(false);
  emailSuccess = signal(false);
  isSending = signal(false);

  sendEmail(event: Event): void {
    event.preventDefault();
    this.isSending.set(true);
    emailjs
      .sendForm(
        'service_4wl205l',
        'template_g2rnp8p',
        event.target as HTMLFormElement,
        'SQCU20t7kVZpEjRV-',
      )
      .then(
        () => {
          this.sendEmailTriggered.set(true);
          this.emailSuccess.set(true);
          this.isSending.set(false);
        },
        (error) => {
          this.sendEmailTriggered.set(true);
          this.isSending.set(false);
          alert('Failed to send email. Please try again.');
        },
      );
  }
}
