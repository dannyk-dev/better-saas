'use client';

import { LoadingSkeleton } from '@/components/loading-skeleton';
import {
  useAuthLoading,
  useAuthError,
  useIsAuthenticated,
  useAuthInitialized,
  useRefreshSession,
  useUser,
} from '@/store/auth-store';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useCallback } from 'react';
import { Button, Card, CardBody as CardContent, CardBody as CardDescription, CardHeader, CardHeader as CardTitle } from '@heroui/react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  showLoginPrompt?: boolean;
  useSkeletonFallback?: boolean;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login',
  showLoginPrompt = true,
  useSkeletonFallback = false,
}: AuthGuardProps) {
  const isAuthenticated = useIsAuthenticated();
  const isLoading = useAuthLoading();
  const error = useAuthError();
  const isInitialized = useAuthInitialized();
  const refreshSession = useRefreshSession();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  // Access current user to inspect onboarding status
  const user = useUser();

  const getCurrentPath = useCallback(() => {
    const search = searchParams.toString();
    return pathname + (search ? `?${search}` : '');
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      const currentPath = getCurrentPath();
      const separator = redirectTo.includes('?') ? '&' : '?';
      const loginUrl = `${redirectTo}${separator}callbackUrl=${currentPath}`;
      router.push(loginUrl);
    }
  }, [isInitialized, isLoading, isAuthenticated, redirectTo, router, getCurrentPath]);

  // Redirect authenticated users who have not completed onboarding
  useEffect(() => {
    if (
      isInitialized &&
      !isLoading &&
      isAuthenticated &&
      user &&
      // Many user objects returned from Better‑Auth are plain JS objects.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user.hasOnboarded === false &&
      pathname !== '/onboarding'
    ) {
      router.replace('/onboarding');
    }
  }, [isInitialized, isLoading, isAuthenticated, user, pathname, router]);

  if (!isInitialized || isLoading) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (useSkeletonFallback) {
      return <LoadingSkeleton />;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground text-sm">
              {t('loading')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>{t('error')}</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => refreshSession()} className="w-full">
              {t('refreshSession')}
            </Button>
            <Button variant="bordered" onClick={() => router.push(redirectTo)} className="w-full">
              {t('goToLogin')}
            </Button>
            <Button variant="ghost" onClick={() => window.location.reload()} className="w-full">
              {t('retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (!showLoginPrompt) {
      return null;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{t('accessDenied')}</CardTitle>
            <CardDescription>
              {t('loginRequired')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                const currentPath = getCurrentPath();
                const separator = redirectTo.includes('?') ? '&' : '?';
                const loginUrl = `${redirectTo}${separator}callbackUrl=${currentPath}`;
                router.push(loginUrl);
              }}
              className="w-full"
            >
              {t('login')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
