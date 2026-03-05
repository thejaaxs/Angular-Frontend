import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../services/toast.service';

@Component({
  standalone: true,
  selector: 'app-toast-container',
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <article
        *ngFor="let toast of toastService.toasts$ | async"
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.info]="toast.type === 'info'"
      >
        <p>{{ toast.message }}</p>
        <button type="button" class="close-btn" (click)="toastService.dismiss(toast.id)">x</button>
      </article>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      right: 1rem;
      bottom: 1rem;
      z-index: 6000;
      display: grid;
      gap: 0.6rem;
      width: min(420px, calc(100vw - 2rem));
    }

    .toast {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 0.6rem;
      padding: 0.76rem 0.86rem;
      border-radius: 14px;
      border: 1px solid var(--mm-border);
      background: #f8fbff;
      box-shadow: var(--mm-shadow-md);
    }

    .toast p {
      margin: 0;
      font-size: 0.88rem;
      color: #203b5e;
      line-height: 1.3;
    }

    .toast.success {
      background: #edf9f2;
      border-color: #b7e3c5;
    }

    .toast.error {
      background: #fff3f4;
      border-color: #f5c2c8;
    }

    .toast.info {
      background: #f2f7ff;
      border-color: #bfd5fb;
    }

    .close-btn {
      min-width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 0;
      padding: 0;
      background: #dce8fb;
      color: #23466f;
      cursor: pointer;
      font-weight: 700;
      line-height: 1;
    }
  `]
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) {}
}
