import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import AuthErrorBanner from './components/auth/AuthErrorBanner';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function App() {
  const { identity, isInitializing, loginError } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [showError, setShowError] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Show error when it appears
  useEffect(() => {
    if (loginError) {
      setShowError(true);
    }
  }, [loginError]);

  // Clear error display when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setShowError(false);
    }
  }, [isAuthenticated]);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/expense-logo.dim_512x512.png" 
                alt="Expense Tracker" 
                className="w-10 h-10"
              />
              <h1 className="text-xl font-semibold">Daily Expenses</h1>
            </div>
            <LoginButton />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {showError && loginError && (
              <AuthErrorBanner error={loginError} onDismiss={() => setShowError(false)} />
            )}
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Track Your Expenses</h2>
              <p className="text-muted-foreground">
                Sign in to start managing your daily expenses with manual entry and Presentbin import.
              </p>
            </div>
            <div className="pt-4">
              <LoginButton />
            </div>
          </div>
        </main>
        <footer className="border-t py-6 bg-card/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} · Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Check if we need to show profile setup (avoiding flash)
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <>
      <ProfileSetupModal open={showProfileSetup} />
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/assets/generated/expense-logo.dim_512x512.png" 
                alt="Expense Tracker" 
                className="w-10 h-10"
              />
              <h1 className="text-xl font-semibold">Daily Expenses</h1>
            </div>
            <div className="flex items-center gap-4">
              {userProfile && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  Welcome, {userProfile.name}
                </span>
              )}
              <LoginButton />
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Dashboard />
        </main>
        <footer className="border-t py-6 bg-card/30">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} · Built with love using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
