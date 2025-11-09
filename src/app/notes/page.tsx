import Navbar from "@/components/Navbar";
import LifeProgress from "@/components/LifeProgress";
import Footer from "@/components/Footer";
import Link from "next/link";
import { getAllNotes, getAllCategories } from "@/lib/markdown";
import { ChevronDown } from "lucide-react";

export default function NotesPage() {
  const allNotes = getAllNotes();
  const categories = getAllCategories();

  // 按分类组织笔记
  const notesByCategory: Record<string, typeof allNotes> = {};
  categories.forEach((category) => {
    notesByCategory[category] = allNotes.filter(
      (note) => note.slug.startsWith(category)
    );
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <div className="pt-16">
        <LifeProgress />

        <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden md:block">
            <div className="sticky top-24 space-y-2">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                分类
              </h3>
              {categories.map((category) => (
                <details key={category} className="group" open>
                  <summary className="flex items-center justify-between cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                    <ChevronDown className="w-4 h-4 transform group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="ml-4 mt-2 space-y-1">
                    {notesByCategory[category]?.map((note) => (
                      <Link
                        key={note.slug}
                        href={`/notes/${note.slug}`}
                        className="block px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded transition-colors"
                      >
                        {note.metadata.title}
                      </Link>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              所有笔记
            </h1>

            {allNotes.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 dark:text-gray-400">
                  还没有笔记，在 <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">content/notes/</code> 添加Markdown文件开始写作吧！
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {allNotes.map((note) => (
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
                        {note.metadata.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/tags/${encodeURIComponent(String(tag))}`}
                            className="text-xs text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-pink-400"
                          >
                            #{tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
