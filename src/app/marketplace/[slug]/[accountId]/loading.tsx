import { ContentLayout } from "@/components/panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountDetailLoading() {
  return (
    <ContentLayout title="Detail Akun">
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-40" />
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left Column: Banner & Specs */}
          <div className="space-y-6 lg:col-span-8">
            {/* Main Image Gallery */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border shadow-lg">
              <Skeleton className="h-full w-full rounded-none" />
            </div>

            {/* Title & Basic Info Card */}
            <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-7 w-3/4" />
              <div className="flex items-baseline gap-3 border-t pt-4 lg:hidden">
                <Skeleton className="h-7 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            {/* Key Specifications Grid */}
            <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
              <Skeleton className="h-5 w-48" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-muted/50 border-border/40 rounded-2xl border p-3.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-2 h-4 w-24" />
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Account Description */}
            <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-6 shadow-sm">
              <Skeleton className="h-5 w-56" />
              <div className="space-y-2.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Skeleton className="h-1.5 w-1.5 rounded-full" />
                    <Skeleton className="h-4 w-10/12" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Price Card & Seller */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">
            {/* Price & Purchase CTA Box */}
            <div className="border-primary/30 bg-card space-y-6 rounded-3xl border p-6 shadow-xl">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-9 w-44" />
              </div>
              <div className="space-y-3 pt-2">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
              <div className="space-y-2.5 border-t pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Seller Profile Box */}
            <div className="border-border/70 bg-card space-y-4 rounded-3xl border p-5 shadow-sm">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
