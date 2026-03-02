import React from 'react';

const SkeletonBox = ({ className }: { className?: string }) => (
  <div className={`bg-gray-200 rounded-md animate-pulse ${className}`} />
);

export default function HarmonizationSkeleton() {
  return (
    <div className="auth-card">
      {/* Progress bar skeleton */}
      <div className="w-full mb-8">
        <div className="flex justify-between items-center mb-2 gap-2">
          <SkeletonBox className="h-4 w-1/4" />
          <SkeletonBox className="h-3 w-1/5" />
        </div>
        <SkeletonBox className="h-1 w-full" />
      </div>

      {/* Back button skeleton */}
      <div className="w-full flex justify-start mb-6">
        <SkeletonBox className="h-8 w-20" />
      </div>

      {/* Header skeleton */}
      <div className="mb-8 text-center">
        <SkeletonBox className="h-16 w-16 mx-auto mb-6 rounded-full" />
        <SkeletonBox className="h-4 w-1/4 mx-auto mb-2" />
        <SkeletonBox className="h-8 w-1/2 mx-auto mb-4" />
        <SkeletonBox className="h-5 w-3/4 mx-auto" />
      </div>

      {/* Account card skeleton */}
      <div className="space-y-4 mb-8 text-left">
        <div className="relative flex items-start p-4 rounded-xl border-2 border-gray-200">
          <SkeletonBox className="h-5 w-5 mt-1 rounded" />
          <div className="ml-3 flex-1">
            <SkeletonBox className="h-5 w-1/2 mb-2" />
            <SkeletonBox className="h-4 w-1/3 mb-3" />
            <SkeletonBox className="h-4 w-1/4" />
          </div>
        </div>
      </div>

      {/* Summary box skeleton */}
      <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-200">
        <SkeletonBox className="h-4 w-1/3 mb-4" />
        <div className="space-y-3 text-xs">
          <div className="flex justify-between">
            <SkeletonBox className="h-3 w-1/4" />
            <SkeletonBox className="h-3 w-1/3" />
          </div>
          <div className="flex justify-between">
            <SkeletonBox className="h-3 w-1/5" />
            <SkeletonBox className="h-3 w-2/5" />
          </div>
        </div>
      </div>

      {/* Buttons skeleton */}
      <SkeletonBox className="h-12 w-full mb-4" />
      <SkeletonBox className="h-8 w-1/3 mx-auto" />
    </div>
  );
}