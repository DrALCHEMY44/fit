import type { Metadata } from "next";
import "@/styles/index.css";

export const metadata: Metadata = {
  title: "Freelance Interconnect Marketplace Design",
  description: "Connect freelancers and clients across Cameroon and Africa with a user-friendly marketplace that streamlines job search, proposals, and contract management.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full margin-0">
        {children}
      </body>
    </html>
  );
}
