// components/investments/InvestmentSkeleton.tsx

export function InvestmentSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6 animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-6 bg-neutral-200 rounded w-16"></div>
          <div className="h-4 bg-neutral-100 rounded w-20"></div>
        </div>
      </div>

      {/* Type */}
      <div className="mb-4">
        <div className="h-6 bg-neutral-100 rounded w-24"></div>
      </div>

      {/* Financial Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-4 bg-neutral-100 rounded w-20 mb-1"></div>
          <div className="h-6 bg-neutral-200 rounded w-24"></div>
        </div>
        <div>
          <div className="h-4 bg-neutral-100 rounded w-24 mb-1"></div>
          <div className="h-6 bg-neutral-200 rounded w-20"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="h-4 bg-neutral-100 rounded w-16 mb-1"></div>
          <div className="h-6 bg-neutral-200 rounded w-16"></div>
        </div>
        <div>
          <div className="h-4 bg-neutral-100 rounded w-28 mb-1"></div>
          <div className="h-6 bg-neutral-200 rounded w-20"></div>
        </div>
      </div>

      {/* Issuer */}
      <div className="pt-4 border-t border-neutral-100">
        <div className="h-4 bg-neutral-100 rounded w-32"></div>
      </div>
    </div>
  );
}

export function InvestmentSkeletonGroup() {
  return (
    <div className="mb-8">
      {/* Group Title */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-neutral-200 rounded w-48"></div>
        <div className="h-6 bg-neutral-100 rounded w-32"></div>
      </div>
      
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <InvestmentSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
