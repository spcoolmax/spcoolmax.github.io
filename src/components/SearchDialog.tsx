"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type Result = {
  type: "note" | "photograph";
  title: string;
  slug: string;
  path: string;
  date?: string;
  tags?: string[];
  category?: string;
  snippet: string;
};

type IndexItem = {
  type: "note" | "photograph";
  title: string;
  slug: string;
  path: string;
  date?: string;
  tags?: string[];
  category?: string;
  content: string;
};

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [index, setIndex] = useState<IndexItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[active]) {
        const href = results[active].path;
        // Allow Next Link navigation by setting window.location
        window.location.href = href;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, active, onClose]);

  const debouncedQuery = useDebounce(query, 200);

  // Load static index once (from public/search-index.json)
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (index) return; // already loaded
      try {
        const res = await fetch("/search-index.json", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) setIndex((data.items || []) as IndexItem[]);
      } catch (_) {
        // ignore; index will remain null
      }
    };
    if (open) load();
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }
    if (!index) {
      // Not loaded yet; show loading state
      setLoading(true);
      return;
    }

    setLoading(true);
    const q = debouncedQuery.toLowerCase();

    const filtered: Result[] = index
      .filter((it) => {
        const hay = [
          it.title,
          it.category || "",
          ...(it.tags || []),
          it.content,
        ]
          .join("\n")
          .toLowerCase();
        return hay.includes(q);
      })
      .map((it) => ({
        type: it.type,
        title: it.title,
        slug: it.slug,
        path: it.path,
        date: it.date,
        tags: it.tags,
        category: it.category,
        snippet: makeSnippet(it.content, debouncedQuery),
      }))
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "note" ? -1 : 1;
        const ad = a.date ? new Date(a.date).getTime() : 0;
        const bd = b.date ? new Date(b.date).getTime() : 0;
        return bd - ad;
      });

    setResults(filtered);
    setLoading(false);
  }, [debouncedQuery, index]);

  function makeSnippet(content: string, query: string, radius = 60) {
    const idx = content.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return content.substring(0, radius * 2) + (content.length > radius * 2 ? "..." : "");
    const start = Math.max(0, idx - radius);
    const end = Math.min(content.length, idx + query.length + radius);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < content.length ? "..." : "";
    return prefix + content.substring(start, end) + suffix;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-24">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索 Markdown（标题、标签与内容）..."
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded">Esc</kbd>
        </div>
        <div className="max-h-96 overflow-auto">
          {loading && (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">搜索中...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">没有找到与“{query}”匹配的结果</div>
          )}
          {!loading && results.length > 0 && (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {results.map((r, idx) => (
                <li key={`${r.type}-${r.slug}`} className={"bg-white dark:bg-gray-900"}>
                  <Link
                    href={r.path}
                    onClick={onClose}
                    className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      idx === active ? "bg-gray-50 dark:bg-gray-800" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-pink-100/70 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                        {r.type === "note" ? "Note" : "Photo"}
                      </span>
                      {r.category && <span className="capitalize">{r.category}</span>}
                      {r.date && <span>{new Date(r.date).toLocaleDateString("zh-CN")}</span>}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">{r.title}</div>
                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{r.snippet}</div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function useDebounce<T>(value: T, delay = 200) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
