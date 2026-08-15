import { ContentLayout } from "@/components/panel/content-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderLoading() {
  return (
    <ContentLayout title="Order">
      <main className="relative pb-28 sm:pb-0">
        {/* Game Banner + Header Card */}
        <div className="relative w-full">
          <Skeleton className="h-48 w-full md:h-64 lg:h-80 lg:rounded-2xl" />
          <section className="z-5 relative -mt-10 px-8 sm:px-12 lg:px-16">
            <div className="bg-background/90 ring-border flex flex-col gap-6 rounded-xl p-4 shadow-sm ring-1 backdrop-blur-md md:flex-row md:items-center md:p-6">
              <Skeleton className="mx-auto h-24 w-24 rounded-xl md:mx-0 md:h-28 md:w-28" />
              <div className="flex flex-1 flex-col items-center gap-2 text-center md:items-start md:text-left">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="mt-2 hidden gap-6 md:flex">
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 lg:mt-8">
          <div className="gap-8 sm:flex sm:flex-col sm:space-y-6 lg:grid lg:grid-cols-3 lg:items-start">
            {/* Left Column: Description, Inputs, Products, Payment */}
            <div className="space-y-6 sm:space-y-8 lg:col-span-2">
              {/* Game Description */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
              </div>

              {/* Input Selection Card */}
              <div className="border-border bg-card space-y-4 rounded-xl border p-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-11 w-full" />
                <Skeleton className="h-11 w-full" />
              </div>

              {/* Product Selection Card */}
              <div className="border-border bg-card space-y-3 rounded-xl border p-5">
                <Skeleton className="h-5 w-44" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Selection Card */}
              <div className="border-border bg-card space-y-3 rounded-xl border p-5">
                <Skeleton className="h-5 w-52" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border p-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Details Card */}
              <div className="border-border bg-card space-y-3 rounded-xl border p-5">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="sticky top-28 hidden space-y-4 lg:block">
              <div className="border-border bg-card space-y-4 rounded-2xl border p-6">
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-40" />
                </div>
                <div className="space-y-3 pt-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              </div>
              <div className="border-border bg-card rounded-2xl border p-6">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </ContentLayout>
  );
}
