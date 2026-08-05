import { ContentLayout } from "@/components/panel/content-layout";
import { OrdersListClient } from "./OrdersListClient";

interface PageProps {
  params: Promise<{ whatsapp: string }>;
}

export default async function InvoicesByWhatsappPage({ params }: PageProps) {
  const { whatsapp } = await params;

  return (
    <ContentLayout title="WhatsApp Invoice">
      <div className="mx-auto max-w-4xl py-6">
        <OrdersListClient whatsapp={whatsapp} />
      </div>
    </ContentLayout>
  );
}
