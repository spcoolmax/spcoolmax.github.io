import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getPhotographBySlug, getAllPhotographs } from "@/lib/markdown";
import { notFound } from "next/navigation";
import ReactMarkdown from 'react-markdown';
import type { ReactNode, ReactElement } from 'react';
import GiscusComments from "@/components/GiscusComments";
import fs from "fs";
import path from "path";
import { FileText, Clock } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

// 生成静态路径（支持子目录）
export async function generateStaticParams() {
  const photographs = getAllPhotographs();
  return photographs.map((photo) => ({ slug: photo.slug.split('/') }));
}

export default async function PhotographPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const photograph = getPhotographBySlug(slugStr);

  if (!photograph) {
    notFound();
  }

  const allPhotos = getAllPhotographs();
  const groups = groupByFirstSegment(allPhotos);
  const currentGroup = slug[0] ?? '(root)';
  const toc = buildToc(photograph.content);
  const stats = readingStats(photograph.content);
  const filePath = path.join(process.cwd(), 'content', 'photographs', ...slug) + '.md';
  const mtime = fs.existsSync(filePath) ? fs.statSync(filePath).mtime : null;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar: Albums (按子目录分组) */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-3">
              <details open>
                <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">系列</summary>
                <div className="ml-1 mt-2 space-y-2">
                  {Object.keys(groups).sort().map((group) => (
                    <details key={group} className="group" open={group === currentGroup}>
                      <summary className="px-3 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                        {group}
                      </summary>
                      <div className="mt-1 space-y-1">
                        {groups[group].map((p) => (
                          <Link
                            key={p.slug}
                            href={`/photographs/${p.slug}`}
                            className={`block px-3 py-2 text-sm rounded ${
                              p.slug === photograph.slug
                                ? "bg-gray-100 text-gray-900 dark:bg-white/10 dark:text-white"
                                : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/5"
                            }`}
                          >
                            {p.metadata.title}
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </details>
            </div>
          </aside>

          <article className="lg:col-span-6">
            {/* Top-right stats */}
            <div className="flex items-center justify-end gap-4 mb-4 text-sm text-gray-400">
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
            <header className="mb-12 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {photograph.metadata.title}
              </h1>
              <time className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(photograph.metadata.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                })}
              </time>
            </header>

            {/* Content with Photos */}
            <div className="space-y-8">
              <ReactMarkdown
                components={{
                h1: ({ children }) => (
                    <h1 id={slugify(children)} className="text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white text-center">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 id={slugify(children)} className="text-2xl font-bold mt-10 mb-4 text-gray-900 dark:text-white text-center">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 id={slugify(children)} className="text-xl font-semibold mt-8 mb-3 text-gray-900 dark:text-white">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => {
                    const isCaption = typeof children === 'object' && Array.isArray(children) && children.length === 1;
                    return (
                      <p className={`mb-6 text-center ${isCaption ? 'text-gray-500 dark:text-gray-400 italic text-sm' : 'text-gray-700 dark:text-gray-300 leading-relaxed'}`}>
                        {children}
                      </p>
                    );
                  },
                img: ({ src, alt }) => (
                  <img src={src as string} alt={(alt as string) || ''} className="w-full rounded-lg my-8" />
                ),
                  em: ({ children }) => <em className="text-gray-600 dark:text-gray-400">{children}</em>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-pink-500 pl-6 italic text-gray-600 dark:text-gray-400 my-8">{children}</blockquote>
                  ),
                }}
              >
                {photograph.content}
              </ReactMarkdown>
            </div>
          </article>

          {/* Right Sidebar: TOC */}
          <aside className="hidden xl:block lg:col-span-3 toc-aside">
            <div className="sticky top-24">
              <details open>
                <summary className="font-semibold text-gray-900 dark:text-white mb-3 cursor-pointer">目录</summary>
                {toc.length === 0 ? (
                  <div className="text-sm text-gray-600 dark:text-gray-400">无标题</div>
                ) : (
                  <ul className="text-sm space-y-1">
                    {toc.map((item) => (
                      <li key={item.id} style={{ paddingLeft: (item.level - 1) * 12 }}>
                        <a href={`#${item.id}`} className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
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

      {/* Prev / Next navigation within current group */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        {PrevNextPhoto({ currentSlug: photograph.slug })}
        <div className="mt-4 text-xs text-gray-400 text-right">
          最后修改：{mtime ? new Date(mtime).toLocaleString('zh-CN') : '未知'}
        </div>
        <GiscusComments />
      </div>

      <Footer />
    </div>
  );
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

function groupByFirstSegment(all: ReturnType<typeof getAllPhotographs>) {
  const groups: Record<string, typeof all> = {};
  for (const p of all) {
    const seg = p.slug.includes('/') ? p.slug.split('/')[0] : '(root)';
    (groups[seg] ||= []).push(p);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime());
  }
  return groups;
}

function PrevNextPhoto({ currentSlug }: { currentSlug: string }) {
  const list = getAllPhotographs();
  const idx = list.findIndex((p) => p.slug === currentSlug);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  return (
    <div className="pt-6 border-t border-gray-800 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {prev ? (
          <a href={`/photographs/${prev.slug}`} className="block group">
            <div className="text-xs text-gray-400">上一篇</div>
            <div className="truncate text-pink-400 group-hover:underline">{prev.metadata.title}</div>
          </a>
        ) : <span />}
      </div>
      <div className="text-right min-w-0">
        {next ? (
          <a href={`/photographs/${next.slug}`} className="block group">
            <div className="text-xs text-gray-400">下一篇</div>
            <div className="truncate text-pink-400 group-hover:underline">{next.metadata.title}</div>
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
  const minutes = Math.max(1, Math.ceil((cjkChars / 300) + (latinWords / 200)));
  return { words, minutes };
}
