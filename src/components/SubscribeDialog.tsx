import type * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail } from 'lucide-react';
import { FollowItForm } from './FollowItForm';

interface SubscribeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubscribeDialog({ open, onOpenChange }: SubscribeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Mail className="h-6 w-6 text-primary" />
            Subscribe to Algo Jua
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get the latest insights on AI, technology, and lifestyle delivered straight to your inbox.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <FollowItForm />
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By subscribing, you agree to our Privacy Policy and Terms of Service.
        </p>
      </DialogContent>
    </Dialog>
  );
}
