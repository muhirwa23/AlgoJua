import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import { CheckCircle2, XCircle, Loader2, MailX } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || '';

export function Unsubscribe() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const processUnsubscribe = async () => {
      try {
        const response = await fetch(`${API_URL}/api/newsletter/unsubscribe/${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'You have been unsubscribed.');
          setEmail(data.email || '');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to unsubscribe');
        }
      } catch {
        setStatus('error');
        setMessage('An error occurred. Please try again later.');
      }
    };

    if (token) {
      processUnsubscribe();
    } else {
      setStatus('error');
      setMessage('Invalid unsubscribe link');
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
              <h1 className="text-2xl font-bold mb-2">Processing...</h1>
              <p className="text-muted-foreground">Please wait while we process your request.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <MailX className="h-16 w-16 text-gray-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Unsubscribed</h1>
              <p className="text-muted-foreground mb-4">{message}</p>
              {email && (
                <p className="text-sm text-muted-foreground mb-6">
                  Email: <strong>{email}</strong>
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                We're sorry to see you go. You won't receive any more emails from us.
              </p>
              <Button asChild>
                <Link to="/">Return to Homepage</Link>
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
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

export default Unsubscribe;
