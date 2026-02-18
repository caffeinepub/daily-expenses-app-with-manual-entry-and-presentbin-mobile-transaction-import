import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import AuthErrorBanner from './AuthErrorBanner';
import { useState, useEffect } from 'react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [showError, setShowError] = useState(false);

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const isLoggingIn = loginStatus === 'logging-in';

  // Show error when it appears
  useEffect(() => {
    if (loginError) {
      setShowError(true);
    }
  }, [loginError]);

  // Clear error display on successful login
  useEffect(() => {
    if (loginStatus === 'success') {
      setShowError(false);
    }
  }, [loginStatus]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      try {
        await clear();
        queryClient.clear();
      } catch (error) {
        console.error('Logout error:', error);
      }
    } else {
      // Clear error display before attempting login
      setShowError(false);
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        // Error will be shown via useEffect
      }
    }
  };

  const handleDismissError = () => {
    setShowError(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleAuth}
        disabled={isLoggingIn}
        variant={isAuthenticated ? 'outline' : 'default'}
        size="default"
        className="gap-2"
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Logging in...
          </>
        ) : isAuthenticated ? (
          <>
            <LogOut className="w-4 h-4" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Login
          </>
        )}
      </Button>
      {!isAuthenticated && showError && loginError && (
        <div className="min-w-[300px]">
          <AuthErrorBanner error={loginError} onDismiss={handleDismissError} />
        </div>
      )}
    </div>
  );
}
