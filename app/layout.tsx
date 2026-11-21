import type { Metadata, Viewport } from "next";
import StageRuntime from "@/components/StageRuntime";
import { scaleBootScript } from "@/lib/scale";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: scaleBootScript }} />
        <StageRuntime />
        {children}
      </body>
    </html>
  );
}
