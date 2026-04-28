import {
  Component,
  signal,
} from '@angular/core';
import emailjs from 'emailjs-com';
import { FadeInDirective } from '../../core/directives/fade-in.directive';
import { HeaderAnimationDirective } from '../../core/directives/header-animation.directive';

@Component({
  selector: 'app-contact',
  imports: [FadeInDirective, HeaderAnimationDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {

  showSubmissionOverlay = signal(false);
  sendEmailTriggered = signal(false);
  emailSuccess = signal(false);
  isSending = signal(false);

  closeSubmissionOverlay(): void {
    this.showSubmissionOverlay.set(false);
    this.sendEmailTriggered.set(false);
  }

  sendEmail(event: Event): void {
    event.preventDefault();
    this.isSending.set(true);
    emailjs
      .sendForm(
        'service_oho6pbs',
        'template_y6f7ddg',
        event.target as HTMLFormElement,
        'IF34-1wHmyGvt5E4v',
      )
      .then(
        () => {
          this.sendEmailTriggered.set(true);
          this.emailSuccess.set(true);
          this.isSending.set(false);
        },
        (error) => {
          this.sendEmailTriggered.set(true);
          this.emailSuccess.set(false); // ADD THIS
          this.isSending.set(false);
          alert('Failed to send email. Please try again.');
        },
      );
  }
}
