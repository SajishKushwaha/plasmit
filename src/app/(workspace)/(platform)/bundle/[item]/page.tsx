import { BundlePage } from "@/features/platform/bundle/bundle-page";

export default async function BundleItemRoute({ params }: { params: Promise<{ item: string }> }) {
  const { item } = await params;
  return <BundlePage itemId={item} />;
}
