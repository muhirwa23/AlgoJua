import { usePageAnalytics } from "@/lib/analytics";

export function AnalyticsTracker() {
  usePageAnalytics();
  return null;
}

export default AnalyticsTracker;
