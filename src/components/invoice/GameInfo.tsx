import Image from "next/image";
import { InvoiceMedia, Transaction } from "@/types";
import { resolveStorageUrl } from "@/lib/utils";

interface InvoiceGameInfoProps {
  order: Transaction;
  game: InvoiceMedia | null;
  product: InvoiceMedia | null;
}

export function InvoiceGameInfo({ order, game, product }: InvoiceGameInfoProps) {
  const rawImage = product?.image || product?.logo || game?.image || game?.logo || null;
  const imageSrc = resolveStorageUrl(rawImage);

  const altText = product?.title || game?.title || order.games || "Product Image";

  const fallbackLabel = (order.games || product?.title || game?.title || "?")
    .toString()
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="border-border bg-muted/50 flex items-start gap-4 rounded-2xl border p-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg">
        {imageSrc ? (
          <Image
            alt={altText}
            src={imageSrc}
            fill
            className="object-cover object-center"
            sizes="80px"
            style={{ position: "absolute", inset: 0 }}
          />
        ) : (
          <div className="bg-muted text-muted-foreground flex h-full w-full items-center justify-center text-lg font-semibold">
            {fallbackLabel}
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div>
          <h3 className="text-md text-foreground font-semibold">{order.games}</h3>
          <p className="text-muted-foreground text-sm">{order.product}</p>
        </div>

        <div className="space-y-1 text-sm">
          {order.nickname && (
            <div className="flex text-sm">
              <span className="text-muted-foreground w-20">Nickname</span>
              <span className="text-foreground">: {order.nickname}</span>
            </div>
          )}

          <div className="flex text-sm">
            <span className="text-muted-foreground w-20">ID</span>
            <span className="text-foreground">: {order.id_games}</span>
          </div>

          {order.server_games && (
            <div className="flex text-sm">
              <span className="text-muted-foreground w-20">Server</span>
              <span className="text-foreground">: {order.server_games}</span>
            </div>
          )}

          <div className="flex text-sm">
            <span className="text-muted-foreground w-20">Jumlah</span>
            <span className="text-foreground">
              : {Math.max(1, Math.floor(Number((order as any).quantity ?? 1) || 1))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
