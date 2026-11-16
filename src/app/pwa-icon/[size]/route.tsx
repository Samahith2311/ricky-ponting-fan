import { iconImage } from "@/lib/og";

// The two sizes the web app manifest lists; anything else is a 404.
export const dynamicParams = false;
export const generateStaticParams = () => [{ size: "192" }, { size: "512" }];

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  return iconImage(Number((await params).size));
}
