interface OrderSummaryMobileProps {
  selectedProductDetails: { title: string } | null;
  totalPrice: number;
  isLoading: boolean;
}

export default function OrderSummaryMobile({
  selectedProductDetails,
  totalPrice,
  isLoading,
}: OrderSummaryMobileProps) {
  return (
    <div className="bg-muted dark:shadow-secondary fixed inset-x-0 bottom-0 z-40 block w-full space-y-4 rounded-t-2xl p-4 shadow lg:hidden">
      {selectedProductDetails ? (
        <div className="text-card-foreground flex items-center justify-between rounded-2xl border border-dashed border-gray-500 p-3 text-sm shadow-sm">
          <div>
            <p className="font-medium">{selectedProductDetails.title}</p>
            <span className="text-muted-foreground text-sm">
              Rp {totalPrice.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-secondary-foreground rounded-2xl border border-dashed border-gray-500 text-sm">
          <div className="flex h-[4em] items-center justify-center text-center text-xs">
            Belum ada item produk yang dipilih.
          </div>
        </div>
      )}
      <button
        type="submit"
        className="ring-offset-background focus-visible:ring-ring bg-my-color text-foreground hover:bg-my-hoverColor bg-size-200 bg-pos-0 before:animate-rainbow hover:bg-pos-100 inline-flex h-8 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 text-sm font-medium text-white shadow-sm transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              ></circle>
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                className="opacity-75"
              ></path>
            </svg>
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <svg
              width="24"
              height="24"
              viewBox="0 0 25 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.5209 6.87109H8.47891C5.67599 6.87109 3.91895 8.8558 3.91895 11.6636V16.206C3.91895 19.0148 5.66724 20.9985 8.47891 20.9985H16.5199C19.3316 20.9985 21.0818 19.0148 21.0818 16.206V11.6636C21.0818 8.8558 19.3316 6.87109 16.5209 6.87109Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                opacity="0.4"
                d="M9.38477 11.1445C9.45871 11.8684 9.79338 12.5173 10.275 13.0096C10.8509 13.5748 11.639 13.928 12.5019 13.928C14.116 13.928 15.443 12.7119 15.6191 11.1445"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
              <path
                opacity="0.4"
                d="M16.3702 6.87115C16.3702 4.7337 14.6375 3 12.4991 3C10.3616 3 8.62891 4.7337 8.62891 6.87115"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <span>Pesan Sekarang!</span>
          </>
        )}
      </button>
    </div>
  );
}
