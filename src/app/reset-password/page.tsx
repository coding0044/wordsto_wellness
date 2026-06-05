'use client';
import { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  RESET_PASSWORD_LAYOUT,
  RESET_PASSWORD_LOGO,
  RESET_PASSWORD_TITLE,
  RESET_PASSWORD_CARD,
  RESET_PASSWORD_FORM,
  RESET_PASSWORD_FOOTER,
} from '@/styles/reset-password-styles';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const storedToken = sessionStorage.getItem('resetToken');
    const urlToken = searchParams.get('token');
    console.log('URL token:', urlToken);
    console.log('Stored token:', storedToken);
    
    if (!urlToken && storedToken) {
      console.log('Replacing URL with stored token');
      window.history.replaceState({}, '', `?token=${storedToken}`);
    } else if (!urlToken && !storedToken) {
      console.log('No token found, redirecting to forgot-password');
      router.push('/forgot-password');
    }
  }, [token, router, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setMessage('');
    setError('');
    setLoading(true);

    try {
      const resetToken = searchParams.get('token') || sessionStorage.getItem('resetToken');
      
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetEmail');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToken = searchParams.get('token') || sessionStorage.getItem('resetToken');
  
  if (!resetToken) {
    return (
      <div className={RESET_PASSWORD_LAYOUT.container}>
        <div className={RESET_PASSWORD_LAYOUT.wrapper}>
          <div className={RESET_PASSWORD_CARD.container}>
            <div className={RESET_PASSWORD_CARD.invalidContainer}>
              <div className={RESET_PASSWORD_CARD.successIconWrapper}>
                <svg className={RESET_PASSWORD_CARD.successIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className={RESET_PASSWORD_CARD.invalidTitle}>Invalid Reset Link</h3>
              <p className={RESET_PASSWORD_CARD.invalidMessage}>Please request a new password reset link</p>
              <Link href="/forgot-password" className={RESET_PASSWORD_CARD.invalidButton}>
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className={RESET_PASSWORD_LAYOUT.container}>
        <div className={RESET_PASSWORD_LAYOUT.wrapper}>
          <div className={RESET_PASSWORD_CARD.container}>
            <div className={RESET_PASSWORD_CARD.success}>
              <div className={RESET_PASSWORD_CARD.successIconWrapper}>
                <svg className={RESET_PASSWORD_CARD.successIcon} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <h3 className={RESET_PASSWORD_CARD.successTitle}>Password Reset Successful</h3>
              <p className={RESET_PASSWORD_CARD.successMessage}>{message}</p>
              <p className={RESET_PASSWORD_CARD.successRedirect}>Redirecting to login page...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={RESET_PASSWORD_LAYOUT.container}>
      <div className={RESET_PASSWORD_LAYOUT.wrapper}>
        {/* Logo */}
        <div className={RESET_PASSWORD_LOGO.container}>
          <div className={RESET_PASSWORD_LOGO.iconWrapper}>
            <svg className={RESET_PASSWORD_LOGO.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={RESET_PASSWORD_TITLE.container}>
          <h1 className={RESET_PASSWORD_TITLE.title}>Create New Password</h1>
          <p className={RESET_PASSWORD_TITLE.subtitle}>Choose a strong password for your account</p>
        </div>

        {/* Card */}
        <div className={RESET_PASSWORD_CARD.container}>
          {error && (
            <div className={RESET_PASSWORD_CARD.error}>
              {error}
            </div>
          )}
          
          <form className={RESET_PASSWORD_FORM.container} onSubmit={handleSubmit}>
            <div>
              <label className={RESET_PASSWORD_FORM.label}>New Password</label>
              <div className={RESET_PASSWORD_FORM.inputWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={RESET_PASSWORD_FORM.input}
                  placeholder="Enter new password (min 6 chars)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={RESET_PASSWORD_FORM.passwordToggle}
                >
                  {showPassword ? (
                    <svg className={RESET_PASSWORD_FORM.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className={RESET_PASSWORD_FORM.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className={RESET_PASSWORD_FORM.label}>Confirm Password</label>
              <div className={RESET_PASSWORD_FORM.inputWrapper}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={RESET_PASSWORD_FORM.input}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={RESET_PASSWORD_FORM.passwordToggle}
                >
                  {showConfirmPassword ? (
                    <svg className={RESET_PASSWORD_FORM.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className={RESET_PASSWORD_FORM.toggleIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={RESET_PASSWORD_FORM.submitButton}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          {/* Footer */}
          <div className={RESET_PASSWORD_FOOTER.container}>
            <Link href="/login" className={RESET_PASSWORD_FOOTER.link}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className={RESET_PASSWORD_LAYOUT.loadingContainer}>
        <div className={RESET_PASSWORD_LAYOUT.loadingContent}>
          <div className={RESET_PASSWORD_LAYOUT.loadingSpinner}></div>
          <p className={RESET_PASSWORD_LAYOUT.loadingText}>Loading...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}