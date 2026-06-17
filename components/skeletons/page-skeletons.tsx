function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-black/10 ${className}`} />;
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
      <SkeletonBlock className="aspect-[4/3] rounded-none" />
      <div className="p-4">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="mt-3 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-4/5" />
        <SkeletonBlock className="mt-4 h-11 w-full rounded-md" />
      </div>
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <main>
      <section className="bg-ink">
        <div className="container-pad flex min-h-[calc(100vh-80px)] items-center py-16">
          <div className="w-full max-w-2xl">
            <SkeletonBlock className="h-4 w-56 bg-white/20" />
            <SkeletonBlock className="mt-6 h-12 w-full bg-white/20 sm:h-16" />
            <SkeletonBlock className="mt-3 h-12 w-4/5 bg-white/20 sm:h-16" />
            <SkeletonBlock className="mt-6 h-5 w-full bg-white/15" />
            <SkeletonBlock className="mt-2 h-5 w-3/4 bg-white/15" />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SkeletonBlock className="h-12 w-full bg-white/20 sm:w-52" />
              <SkeletonBlock className="h-12 w-full bg-white/15 sm:w-40" />
            </div>
          </div>
        </div>
      </section>
      <section className="container-pad py-16">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="mt-3 h-8 w-72" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)}
        </div>
      </section>
    </main>
  );
}

export function ProductGridSkeleton() {
  return (
    <main className="container-pad py-12">
      <SkeletonBlock className="h-4 w-24" />
      <SkeletonBlock className="mt-4 h-10 w-full max-w-2xl" />
      <SkeletonBlock className="mt-3 h-5 w-full max-w-xl" />
      <div className="mt-8 grid gap-3 rounded-lg border border-black/10 bg-white p-3 shadow-sm md:grid-cols-[1fr_260px]">
        <SkeletonBlock className="h-12 w-full rounded-md" />
        <SkeletonBlock className="h-12 w-full rounded-md" />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    </main>
  );
}

export function ContactSkeleton() {
  return (
    <main className="container-pad py-12">
      <section className="grid gap-8 rounded-lg bg-white p-8 shadow-premium md:grid-cols-[1fr_.9fr] md:p-12">
        <div>
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="mt-4 h-10 w-72" />
          <SkeletonBlock className="mt-5 h-5 w-full max-w-xl" />
          <SkeletonBlock className="mt-2 h-5 w-4/5 max-w-lg" />
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <SkeletonBlock className="h-12 w-full sm:w-44" />
            <SkeletonBlock className="h-12 w-full sm:w-44" />
          </div>
        </div>
        <SkeletonBlock className="min-h-48" />
      </section>
    </main>
  );
}

export function CartSkeleton() {
  return (
    <main className="container-pad py-12">
      <SkeletonBlock className="mb-8 h-10 w-32" />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[88px_1fr] gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-sm">
              <SkeletonBlock className="aspect-square rounded-md" />
              <div>
                <SkeletonBlock className="h-5 w-3/4" />
                <SkeletonBlock className="mt-3 h-3 w-28" />
                <SkeletonBlock className="mt-5 h-10 w-40 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <aside className="h-max rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="mt-4 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-4/5" />
          <SkeletonBlock className="mt-6 h-12 w-full rounded-md" />
        </aside>
      </div>
    </main>
  );
}

export function ProductDetailSkeleton() {
  return (
    <main className="container-pad py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr]">
        <div className="grid gap-4">
          <SkeletonBlock className="aspect-[4/3]" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => <SkeletonBlock key={index} className="aspect-square rounded-md" />)}
          </div>
        </div>
        <section className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="mt-4 h-10 w-full" />
          <SkeletonBlock className="mt-3 h-10 w-4/5" />
          <SkeletonBlock className="mt-6 h-5 w-full" />
          <SkeletonBlock className="mt-2 h-5 w-5/6" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <SkeletonBlock className="h-12 w-full rounded-md" />
            <SkeletonBlock className="h-12 w-full rounded-md" />
          </div>
        </section>
      </div>
    </main>
  );
}
