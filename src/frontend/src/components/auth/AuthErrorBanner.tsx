import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

interface AuthErrorBannerProps {
  error?: Error;
  onDismiss?: () => void;
}

export default function AuthErrorBanner({ error, onDismiss }: AuthErrorBannerProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription className="pr-8">
        {error.message || 'An error occurred during authentication. Please try again.'}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
}
