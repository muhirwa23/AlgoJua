import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || '';

export function ConfirmSubscription() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const confirmSubscription = async () => {
      try {
        const response = await fetch(`${API_URL}/api/newsletter/confirm/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your subscription has been confirmed!');
          setEmail(data.email || '');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm subscription');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };

    if (token) {
      confirmSubscription();
    } else {
      setStatus('error');
      setMessage('Invalid confirmation link');
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-lg mx-auto px-4 py-20">
        <div className="bg-card rounded-xl shadow-lg p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Confirming your subscription...</h1>
              <p className="text-muted-foreground">Please wait while we verify your email.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">You're all set!</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              {email && (
                <p className="text-sm text-muted-foreground mb-6">
                  Subscribed as: <strong>{email}</strong>
                </p>
              )}
              <Button asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Confirmation Failed</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <Button asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ConfirmSubscription;
