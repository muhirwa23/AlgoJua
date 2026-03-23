import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <Skeleton className="h-48 w-full bg-slate-800" />
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 bg-slate-800" />
          <Skeleton className="h-5 w-20 bg-slate-800" />
        </div>
        <Skeleton className="h-7 w-full bg-slate-800" />
        <Skeleton className="h-4 w-full bg-slate-800" />
        <Skeleton className="h-4 w-3/4 bg-slate-800" />
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="h-10 w-10 rounded-full bg-slate-800" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-slate-800" />
            <Skeleton className="h-3 w-32 bg-slate-800" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ArticlePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4 bg-slate-800" />
        <Skeleton className="h-6 w-1/2 mx-auto mb-8 bg-slate-800" />
        <Skeleton className="h-96 w-full rounded-lg mb-8 bg-slate-800" />
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-5/6 bg-slate-800" />
          <Skeleton className="h-8 w-full mt-8 bg-slate-800" />
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-full bg-slate-800" />
          <Skeleton className="h-4 w-4/5 bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-700 border-t-primary`} />
    </div>
  );
}
