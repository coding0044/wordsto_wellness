'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FORGOT_PASSWORD_LAYOUT,
  FORGOT_PASSWORD_LOGO,
  FORGOT_PASSWORD_TITLE,
  FORGOT_PASSWORD_CARD,
  FORGOT_PASSWORD_FORM,
  FORGOT_PASSWORD_FOOTER,
} from '@/styles/forgot-password-styles';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        sessionStorage.setItem('resetEmail', email);
        if (data.otp) {
          sessionStorage.setItem('devOtp', data.otp);
          setDevOtp(data.otp);
        }
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={FORGOT_PASSWORD_LAYOUT.container}>
      <div className={FORGOT_PASSWORD_LAYOUT.wrapper}>
        {/* Logo */}
        <div className={FORGOT_PASSWORD_LOGO.container}>
          <div className={FORGOT_PASSWORD_LOGO.iconWrapper}>
            <svg className={FORGOT_PASSWORD_LOGO.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={FORGOT_PASSWORD_TITLE.container}>
          <h1 className={FORGOT_PASSWORD_TITLE.title}>Reset Password</h1>
          <p className={FORGOT_PASSWORD_TITLE.subtitle}>Enter your email to receive a reset code.</p>
        </div>

        {/* Card */}
        <div className={FORGOT_PASSWORD_CARD.container}>
          {error && (
            <div className={FORGOT_PASSWORD_CARD.error}>
              {error}
            </div>
          )}
          
          <form className={FORGOT_PASSWORD_FORM.container} onSubmit={handleSubmit}>
            <div>
              <label className={FORGOT_PASSWORD_FORM.label}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={FORGOT_PASSWORD_FORM.input}
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={FORGOT_PASSWORD_FORM.button}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>

          {/* Footer */}
          <div className={FORGOT_PASSWORD_FOOTER.container}>
            <p className={FORGOT_PASSWORD_FOOTER.text}>
              Remember your password?{' '}
              <Link href="/login" className={FORGOT_PASSWORD_FOOTER.link}>
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}