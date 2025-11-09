"use client";

import { useEffect, useRef } from "react";

export default function GiscusComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Hardcoded Giscus configuration
  const repo = "spcoolmax/spcoolmax.github.io";
  const repoId = "R_kgDOQR2Dfw";
  const category = "Announcements";
  const categoryId = "DIC_kwDOQR2Df84CxlFJ";

  useEffect(() => {
    if (!containerRef.current) return;

    // Avoid injecting multiple times (StrictMode will double-invoke effects in dev)
    if (containerRef.current.dataset.giscusLoaded === "1") return;
    if (containerRef.current.querySelector("iframe.giscus-frame")) return;

    const theme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";

    script.setAttribute("data-repo", repo);
    script.setAttribute("data-repo-id", repoId);
    script.setAttribute("data-category", category);
    script.setAttribute("data-category-id", categoryId);
    script.setAttribute("data-mapping", "pathname");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "bottom");
    script.setAttribute("data-theme", theme);
    script.setAttribute("data-lang", "zh-CN");

    containerRef.current.appendChild(script);
    containerRef.current.dataset.giscusLoaded = "1";
  }, []);

  return <div ref={containerRef} className="mt-12" />;
}
