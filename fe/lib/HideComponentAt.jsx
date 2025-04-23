"use client";

import { usePathname } from "next/navigation";

const HideComponentAt = ({ path = [], children }) => {
  const pathname = usePathname();
  const paths = (Array.isArray(path) ? path : [path]).map(p =>
    p.startsWith("/") ? p : `/${p}`
  );

  if (paths.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
};

export default HideComponentAt;
