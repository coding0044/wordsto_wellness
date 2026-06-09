'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LOGIN_LAYOUT,
  LOGIN_LOGO,
  LOGIN_TITLE,
  LOGIN_CARD,
  LOGIN_FORM,
  LOGIN_DIVIDER,
  LOGIN_GOOGLE_BUTTON,
  LOGIN_FOOTER,
} from '@/styles/login-styles';

async function parseApiResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text || 'Server returned an invalid response' };
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();

  const handleGoogleLogin = () => {
    setGoogleLoading(true);

    const width = 500;
    const height = 600;

    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    const redirectUri = `${window.location.origin}/api/auth/google/callback`;

    const scope = 'email profile';

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=token` +
      `&scope=${encodeURIComponent(scope)}` +
      `&prompt=select_account`;

    const popup = window.open(
      authUrl,
      'Google Sign In',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        popup?.close();

        window.removeEventListener('message', handleMessage);

        try {
          const res = await fetch(`${window.location.origin}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'same-origin',
            mode: 'same-origin',
            body: JSON.stringify({
              ...event.data.user,
              isLogin: true,
            }),
          });

          const data = await parseApiResponse(res);

          if (res.ok) {
            localStorage.setItem('token', data.token);
            if (data.user?.role === 'admin') {
              router.push('/admin-dashboard');
            } else {
              router.push('/dashboard');
            }
          } else {
            setError(data.message || 'Google login failed');
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Something went wrong with Google login');
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);

        setGoogleLoading(false);

        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        mode: 'same-origin',
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await parseApiResponse(res);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        if (data.user?.role === 'admin') {
          router.push('/admin-dashboard');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.message || 'Invalid login credentials');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={LOGIN_LAYOUT.container}>
      <div className={LOGIN_LAYOUT.wrapper}>
        {/* Logo */}
        <div className={LOGIN_LOGO.container}>
          <div className={LOGIN_LOGO.iconWrapper}>
            <svg className={LOGIN_LOGO.icon} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div className={LOGIN_TITLE.container}>
          <h1 className={LOGIN_TITLE.title}>Sign In</h1>
          <p className={LOGIN_TITLE.subtitle}>Welcome back to Wordstowellness</p>
        </div>

        {/* Card */}
        <div className={LOGIN_CARD.container}>
          {error && (
            <div className={LOGIN_CARD.error}>
              {error}
            </div>
          )}

          <form className={LOGIN_FORM.container} onSubmit={handleSubmit}>
            <div>
              <label className={LOGIN_FORM.label}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={LOGIN_FORM.input}
              />
            </div>

            <div>
              <label className={LOGIN_FORM.label}>Password</label>
              <div className={LOGIN_FORM.passwordContainer}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={LOGIN_FORM.input}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={LOGIN_FORM.passwordToggle}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className={LOGIN_FORM.forgotPasswordLink}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={LOGIN_FORM.submitButton}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className={LOGIN_DIVIDER.container}>
            <div className={LOGIN_DIVIDER.line}>
              <div className={LOGIN_DIVIDER.lineInner}></div>
            </div>
            <div className={LOGIN_DIVIDER.textContainer}>
              <span className={LOGIN_DIVIDER.text}>Or sign in with</span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className={LOGIN_GOOGLE_BUTTON.button}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className={LOGIN_GOOGLE_BUTTON.text}>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </span>
          </button>

          {/* Footer */}
          <div className={LOGIN_FOOTER.container}>
            <p className={LOGIN_FOOTER.text}>
              Don't have an account?{' '}
              <Link href="/signup" className={LOGIN_FOOTER.link}>
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}