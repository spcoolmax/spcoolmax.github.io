"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    document.body.className = "antialiased";
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.classList.remove("page-transition-active");
    // Force reflow so the animation restarts whenever pathname changes
    void el.offsetWidth;
    el.classList.add("page-transition-active");
  }, [pathname]);

  return (
    <div ref={containerRef} className="antialiased page-transition-wrapper">
      {children}
    </div>
  );
}
