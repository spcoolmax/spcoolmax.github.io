import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllNotes } from "@/lib/markdown";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  const notes = getAllNotes();
  const set = new Set<string>();
  for (const n of notes) {
    (n.metadata.tags || []).forEach((t) => set.add(String(t)));
  }
  return Array.from(set).map((tag) => ({ tag }));
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const norm = (s: string) => s.toLowerCase();
  const all = getAllNotes();
  const list = all.filter((n) => (n.metadata.tags || []).some((t) => norm(String(t)) === norm(tag)));

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">#{tag}</h1>

          {list.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400">暂无包含该标签的文章。</p>
            </div>
          ) : (
            <div className="space-y-6">
              {list.map((note) => (
                <div
                  key={note.slug}
                  className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg hover:border-pink-500 dark:hover:border-pink-500 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded capitalize">
                      {note.metadata.category}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(note.metadata.date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    <Link href={`/notes/${note.slug}`} className="hover:text-pink-500 dark:hover:text-pink-400">
                      {note.metadata.title}
                    </Link>
                  </h2>
                  {note.metadata.tags && (
                    <div className="flex flex-wrap gap-2">
                      {note.metadata.tags.map((t) => (
                        <Link
                          key={t}
                          href={`/tags/${encodeURIComponent(String(t))}`}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                        >
                          #{t}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
