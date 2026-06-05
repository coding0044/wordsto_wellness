'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  VERIFY_OTP_LAYOUT,
  VERIFY_OTP_LOGO,
  VERIFY_OTP_TITLE,
  VERIFY_OTP_CARD,
  VERIFY_OTP_FORM,
  VERIFY_OTP_RESEND,
  VERIFY_OTP_FOOTER,
} from '@/styles/verify-otp-styles';

function VerifyOTPForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      const storedEmail = sessionStorage.getItem('resetEmail');
      if (storedEmail) {
        router.push(`/verify-otp?email=${encodeURIComponent(storedEmail)}`);
      } else {
        router.push('/forgot-password');
      }
    }
  }, [email, router]);

  // Timer for OTP expiry
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await res.json();
      console.log('Verify OTP response:', data);

      if (res.ok && data.resetToken) {
        sessionStorage.setItem('resetToken', data.resetToken);
        console.log('Redirecting to reset-password with token:', data.resetToken);
        setError('');
        setMessage('OTP verified! Redirecting to reset password...');
        setTimeout(() => {
          router.push(`/reset-password?token=${data.resetToken}`);
        }, 500);
      } else {
        setMessage('');
        setError(data.message || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setTimeLeft(600);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
        alert('✅ New OTP sent successfully!');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={VERIFY_OTP_LAYOUT.container}>
      <div className={VERIFY_OTP_LAYOUT.wrapper}>
        {/* Logo */}
        <div className={VERIFY_OTP_LOGO.container}>
          <div className={VERIFY_OTP_LOGO.iconWrapper}>
            <svg className={VERIFY_OTP_LOGO.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={VERIFY_OTP_TITLE.container}>
          <h1 className={VERIFY_OTP_TITLE.title}>Verify OTP</h1>
          <p className={VERIFY_OTP_TITLE.subtitle}>Enter the 6-digit code sent to your email</p>
        </div>

        {/* Card */}
        <div className={VERIFY_OTP_CARD.container}>
          {message && (
            <div className={VERIFY_OTP_CARD.success}>
              {message}
            </div>
          )}
          {error && (
            <div className={VERIFY_OTP_CARD.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={VERIFY_OTP_FORM.container}>
            {/* OTP Input Fields */}
            <div className={VERIFY_OTP_FORM.otpContainer}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={VERIFY_OTP_FORM.otpInput}
                  disabled={loading}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Timer */}
            <div className={VERIFY_OTP_FORM.timerContainer}>
              <p className={VERIFY_OTP_FORM.timerText}>
                {timeLeft > 0 ? (
                  <>
                    OTP expires in:{' '}
                    <span className={VERIFY_OTP_FORM.timerBold}>{formatTime(timeLeft)}</span>
                  </>
                ) : (
                  <span className={VERIFY_OTP_FORM.timerExpired}>OTP has expired</span>
                )}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || timeLeft === 0}
              className={VERIFY_OTP_FORM.submitButton}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          {/* Resend OTP */}
          <div className={VERIFY_OTP_RESEND.container}>
            {canResend ? (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                className={VERIFY_OTP_RESEND.button}
              >
                Resend OTP
              </button>
            ) : (
              <p className={VERIFY_OTP_RESEND.waitingText}>
                Didn't receive code? Wait {formatTime(timeLeft)} to resend
              </p>
            )}
          </div>

          {/* Footer */}
          <div className={VERIFY_OTP_FOOTER.container}>
            <Link href="/login" className={VERIFY_OTP_FOOTER.link}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className={VERIFY_OTP_LAYOUT.loadingContainer}>
          <div className={VERIFY_OTP_LAYOUT.loadingContent}>
            <div className={VERIFY_OTP_LAYOUT.loadingSpinner}></div>
            <p className={VERIFY_OTP_LAYOUT.loadingText}>Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyOTPForm />
    </Suspense>
  );
}