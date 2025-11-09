import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import GiscusComments from "@/components/GiscusComments";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { getNoteBySlug, getAllNotes } from "@/lib/markdown";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import type { ReactNode, ReactElement } from 'react';
import { FileText, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

// 生成静态路径（用于静态导出）
export async function generateStaticParams() {
  const notes = getAllNotes();

  return notes.map((note) => ({
    slug: note.slug.split('/'),
  }));
}

export default async function NotePage({ params }: PageProps) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  const allNotes = getAllNotes();
  const currentCategory = slug[0];

  const grouped = groupBySubdir(allNotes, currentCategory);
  const currentDir = slug.length > 2 ? slug[1] : "(root)";

  const toc = buildToc(note.content);
  const stats = readingStats(note.content);
  const filePath = path.join(process.cwd(), 'content', 'notes', ...slug) + '.md';
  const mtime = fs.existsSync(filePath) ? fs.statSync(filePath).mtime : null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Category directory */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">目录</h3>
              <details className="group" open>
                <summary className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{currentCategory}</span>
                </summary>
                <div className="ml-2 mt-2 space-y-2">
                  {Object.keys(grouped).sort().map((dir) => (
                    dir === "(root)" ? (
                      <div key={dir} className="ml-2 mt-2 space-y-1">
                        {grouped[dir].map((n) => (
                          <Link
                            key={n.slug}
                            href={`/notes/${n.slug}`}
                            className={`block px-3 py-2 text-sm rounded transition-colors ${
                              n.slug === note.slug
                                ? "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300"
                                : "text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            }`}
                          >
                            {n.metadata.title}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <details key={dir} className="group" open={dir === currentDir}>
                        <summary className="flex items-center justify-between cursor-pointer px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dir}</span>
                        </summary>
                        <div className="ml-2 mt-2 space-y-1">
                          {grouped[dir].map((n) => (
                            <Link
                              key={n.slug}
                              href={`/notes/${n.slug}`}
                              className={`block px-3 py-2 text-sm rounded transition-colors ${
                                n.slug === note.slug
                                  ? "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300"
                                  : "text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                              }`}
                            >
                              {n.metadata.title}
                            </Link>
                          ))}
                        </div>
                      </details>
                    )
                  ))}
                </div>
              </details>
            </div>
          </aside>

          {/* Main Article */}
          <article className="lg:col-span-6 bg-transparent">
            {/* Top-right stats */}
            <div className="flex items-center justify-end gap-4 mb-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{stats.words.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{stats.minutes} minutes</span>
              </div>
            </div>
            {/* Header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 text-sm font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded capitalize">
                  {note.metadata.category}
                </span>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(note.metadata.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {note.metadata.title}
              </h1>

              {note.metadata.tags && (
                <div className="flex flex-wrap gap-2">
                  {note.metadata.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tags/${encodeURIComponent(String(tag))}`}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </header>

            {/* Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                h1: ({ children }) => (
                  <h1 id={slugify(children)} className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 id={slugify(children)} className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-100">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 id={slugify(children)} className="text-xl font-bold mt-4 mb-2 text-gray-900 dark:text-gray-100">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="ml-4">{children}</li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  return isInline ? (
                    <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm text-pink-600 dark:text-pink-400">
                      {children}
                    </code>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
                pre: ({ children }) => (
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4">
                    {children}
                  </pre>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-pink-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-gray-900 dark:text-gray-100">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic">{children}</em>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt || ''}
                    className="rounded-lg my-6 w-full"
                  />
                ),
              }}
            >
              {note.content}
            </ReactMarkdown>
            </div>

            {/* Prev / Next navigation */}
            {PrevNext({ currentSlug: note.slug })}

            {/* Last modified */}
            <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 text-right">
              最后修改：{mtime ? new Date(mtime).toLocaleString('zh-CN') : '未知'}
            </div>

            {/* GitHub Comments */}
            <GiscusComments />
          </article>

          {/* Right Sidebar: In-article TOC */}
          <aside className="hidden xl:block lg:col-span-3 toc-aside">
            <div className="sticky top-24">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">文章目录</h3>
              <details open>
                <summary className="font-semibold text-gray-900 dark:text-gray-100 mb-3 cursor-pointer">文章目录</summary>
              {toc.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">无标题</div>
              ) : (
                <ul className="text-sm space-y-1">
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: (item.level - 1) * 12 }}>
                      <a href={`#${item.id}`} className="text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              </details>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function PrevNext({ currentSlug }: { currentSlug: string }) {
  const all = getAllNotes();
  const idx = all.findIndex((n) => n.slug === currentSlug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;

  return (
    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {prev ? (
          <a href={`/notes/${prev.slug}`} className="block group">
            <div className="text-xs text-gray-500 dark:text-gray-400">上一篇</div>
            <div className="truncate text-pink-600 dark:text-pink-400 group-hover:underline">{prev.metadata.title}</div>
          </a>
        ) : <span />}
      </div>
      <div className="text-right min-w-0">
        {next ? (
          <a href={`/notes/${next.slug}`} className="block group">
            <div className="text-xs text-gray-500 dark:text-gray-400">下一篇</div>
            <div className="truncate text-pink-600 dark:text-pink-400 group-hover:underline">{next.metadata.title}</div>
          </a>
        ) : <span />}
      </div>
    </div>
  );
}

function readingStats(md: string) {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^\)]*\)/g, " ")
    .replace(/^#+\s+/gm, " ")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cjkChars = (text.match(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g) || []).length;
  const latinWords = (text.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u30FF\uAC00-\uD7AF]/g, " ").trim().split(/\s+/).filter(Boolean) || []).length;
  const words = cjkChars + latinWords;
  // Reading speed: ~300 cjk chars/min, ~200 latin words/min
  const minutes = Math.max(1, Math.ceil((cjkChars / 300) + (latinWords / 200)));
  return { words, minutes };
}

function groupBySubdir(allNotes: ReturnType<typeof getAllNotes>, root: string) {
  const groups: Record<string, typeof allNotes> = {};
  for (const n of allNotes) {
    if (n.slug === root) {
      (groups["(root)"] ||= []).push(n);
      continue;
    }
    if (!n.slug.startsWith(root + "/")) continue;
    const rest = n.slug.slice(root.length + 1);
    const seg = rest.includes("/") ? rest.split("/")[0] : "(root)";
    (groups[seg] ||= []).push(n);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  }
  return groups;
}

function buildToc(md: string) {
  const lines = md.split(/\r?\n/);
  const items: { level: number; text: string; id: string }[] = [];
  for (const line of lines) {
    const m = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].trim();
    const id = simpleSlug(text);
    items.push({ level, text, id });
  }
  return items;
}

function simpleSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function childrenToText(children: ReactNode): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(childrenToText).join('');
  if (children && typeof children === 'object') {
    const el = children as ReactElement<{ children?: ReactNode }>;
    const inner = el.props?.children;
    return inner ? childrenToText(inner) : '';
  }
  return '';
}

function slugify(children: ReactNode) {
  return simpleSlug(childrenToText(children));
}

function slugBase(slug: string) {
  const parts = slug.split('/');
  return parts[parts.length - 1] || slug;
}
