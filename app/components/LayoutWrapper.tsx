"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = pathname == "/read";
  console.log(pathname);

  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
}
