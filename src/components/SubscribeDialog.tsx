import type * as React from 'react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Mail, Loader2, CheckCircle2 } from 'lucide-react';

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscribeDialog({ open, onOpenChange }: SubscribeDialogProps) {
  const [email, setEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to receive emails from us');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      toast.success('Check your email to confirm your subscription!');
      
      setTimeout(() => {
        onOpenChange(false);
        setEmail('');
        setAgreedToTerms(false);
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
      setEmail('');
      setAgreedToTerms(false);
      setIsSuccess(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-6 w-6 text-blue-500" />
            Subscribe to Algo Jua
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get the latest insights on AI, technology, and lifestyle delivered straight to your inbox.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Almost there!</h3>
              <p className="text-sm text-muted-foreground">
                We've sent a confirmation email to <strong>{email}</strong>. 
                Please check your inbox and click the link to complete your subscription.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                autoFocus
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100">What you'll get:</p>
              <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                <li>• Weekly digest of our latest articles</li>
                <li>• Exclusive AI tools and resources</li>
                <li>• Early access to new features</li>
                <li>• No spam, unsubscribe anytime</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to receive emails from Algo Jua and understand I can unsubscribe at any time.
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !email || !agreedToTerms}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By subscribing, you agree to our Privacy Policy and Terms of Service.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
