import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from './app.service';
import { sanitizeString, isValidEmail } from './sanitizer.util';

type ToastType = 'success' | 'error';

interface Toast {
  type: ToastType;
  title: string;
  message: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  loginForm: FormGroup;

  readonly isSubmitting = signal(false);
  readonly toast = signal<Toast | null>(null);

  private systemUrlParam = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private fb: FormBuilder,
    private appService: AppService,
    private route: ActivatedRoute,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.systemUrlParam.set(params['returnUrl'] ?? null);
    });
  }

  private getSanitizedPayload(): { email: string; password: string; systemUrl?: string } {
    const raw = this.loginForm.value;
    const email = sanitizeString(raw.email);

    if (!isValidEmail(email)) {
      this.loginForm.get('email')?.setErrors({ invalidFormat: true });
      throw new Error('Invalid email format after sanitization');
    }

    const url = this.systemUrlParam();
    return {
      email,
      password: raw.password,
      ...(url ? { systemUrl: sanitizeString(url) } : {}),
    };
  }

  showToast(type: ToastType, title: string, message: string): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.set({ type, title, message });
  }

  dismissToast(): void {
    this.toast.set(null);
  }

  onSubmit(): void {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    let payload: ReturnType<typeof this.getSanitizedPayload>;

    try {
      payload = this.getSanitizedPayload();
    } catch {
      return;
    }

    this.isSubmitting.set(true);

    this.appService.login(payload).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        this.showToast(
          'success',
          'Access granted',
          `Welcome, ${response.user.firstName}. Redirecting…`,
        );

        this.toastTimer = setTimeout(() => {
          if (response.redirectUrl) {
            window.location.href = response.redirectUrl;
          }
        }, 2200);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        const status = error?.status;
        let message = 'An unexpected error occurred. Please try again.';

        if (status === 401 || status === 403) {
          message = 'Invalid credentials.';
        } else if (status === 429) {
          message = 'Too many attempts. Please wait before trying again.';
        } else if (status === 0) {
          message = 'Cannot reach the server. Check your connection.';
        }

        this.showToast('error', 'Authentication failed', message);
        console.error('Auth error', error);
      },
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
