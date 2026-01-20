import React from 'react';
import { FollowItForm } from './FollowItForm';

export function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-primary">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/jobs" className="hover:text-primary transition-colors">
                  Jobs
                </a>
              </li>
              <li>
                <a href="/creativity" className="hover:text-primary transition-colors">
                  Creativity
                </a>
              </li>
              <li>
                <a href="/growth" className="hover:text-primary transition-colors">
                  Career
                </a>
              </li>
              <li>
                <a href="/wellness" className="hover:text-primary transition-colors">
                  Wellness
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-primary">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest insights and opportunities.
            </p>
            <div className="max-w-sm">
              <FollowItForm />
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold">
              Algo <span className="text-primary">Jua</span>
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Algo Jua. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
