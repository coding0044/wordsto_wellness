'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ApiRoutes, Routes } from '@/lib/urls';
import { Input, Button, Alert } from '@/components/ui';
import { GRADIENTS, TEXT } from '@/styles';



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

    const redirectUri = `${window.location.origin}${Routes.auth.googleCallback}`;

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
          const res = await fetch(`${window.location.origin}${ApiRoutes.auth.google}`, {
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
              router.push(Routes.adminDashboard);
            } else {
              router.push(Routes.dashboard);
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
      const res = await fetch(`${window.location.origin}${ApiRoutes.auth.login}`, {
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
          router.push(Routes.adminDashboard);
        } else {
          router.push(Routes.dashboard);
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
    <div className={GRADIENTS.pageBg}>
      <div className="flex items-center justify-center px-4 py-12 min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-full bg-sky-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-sky-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`${TEXT.headingMedium} mb-2`}>Sign In</h1>
            <p className={TEXT.subtitle}>Welcome back to Wordstowellness</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            {error && <Alert message={error} type="error" className="mb-6" />}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-sky-600 hover:text-sky-700"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                  <Link
                    href={Routes.auth.forgotPassword}
                    className="text-xs text-sky-600 hover:text-sky-700"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign in with</span>
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              variant="secondary"
              fullWidth
              className="mt-4"
            >
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </Button>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className={`${TEXT.subtitle} mb-0`}>
                Don't have an account?{' '}
                <Link href={Routes.auth.signup} className="text-sky-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}