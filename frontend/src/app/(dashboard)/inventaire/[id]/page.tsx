import { InventaireDetailPage } from "@/features/stock/inventaire/pages/InventaireDetailPage";

export const metadata = { title: "Inventory Detail — StockPro" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InventaireDetailPage id={id} />;
}
